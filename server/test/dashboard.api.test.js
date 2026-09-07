import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { calculateMatch } from "../src/utils/matching.js";

const app = createApp();
const password = "KaushalSetu@2026";
const suffix = `${Date.now()}`;

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function collectStrings(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, bag);
    }
    return bag;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      bag.push(key);
      collectStrings(item, bag);
    }
  }
  return bag;
}

async function register(role, name, tag = "") {
  const email = `phase10.${role.toLowerCase()}${tag}.${suffix}@kaushalsetu.test`;
  const response = await request(app).post("/api/auth/register").send({
    name,
    email,
    password,
    role,
  });
  return { response, email };
}

test("registration issues a session and dashboards enforce RBAC", async (t) => {
  const studentReg = await register("STUDENT", "Phase10 Student");
  assert.equal(studentReg.response.status, 201, studentReg.response.body.message);
  const studentBody = studentReg.response.body.data;
  assert.ok(studentBody.token);
  assert.equal(studentBody.user.email, studentReg.email);
  assert.equal(studentBody.user.role, "STUDENT");
  assert.equal(studentBody.user.password, undefined);
  assert.equal(studentBody.user.passwordHash, undefined);
  assert.equal(JSON.stringify(studentReg.response.body).includes("passwordHash"), false);
  assert.equal(JSON.stringify(studentReg.response.body).includes(`"${password}"`), false);

  const me = await request(app).get("/api/auth/me").set(auth(studentBody.token));
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, studentReg.email);

  const studentDash = await request(app)
    .get("/api/student/dashboard")
    .set(auth(studentBody.token));
  assert.equal(studentDash.status, 200);
  assert.equal(studentDash.body.data.dashboard.hasProfile, false);
  assert.equal(studentDash.body.data.dashboard.metrics.industryReadiness.available, false);
  assert.equal(studentDash.body.data.dashboard.metrics.industryReadiness.percentage, null);

  const login = await request(app).post("/api/auth/login").send({
    email: studentReg.email,
    password,
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.data.token);

  const duplicate = await request(app).post("/api/auth/register").send({
    name: "Dup",
    email: studentReg.email,
    password,
    role: "STUDENT",
  });
  assert.equal(duplicate.status, 409);

  const admin = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: `phase10.admin.${suffix}@kaushalsetu.test`,
    password,
    role: "ADMIN",
  });
  assert.equal(admin.status, 403);

  const industryReg = await register("INDUSTRY", "Phase10 Industry");
  assert.equal(industryReg.response.status, 201);
  const industryToken = industryReg.response.body.data.token;

  const institutionReg = await register("INSTITUTION", "Phase10 Institution");
  assert.equal(institutionReg.response.status, 201);
  const institutionToken = institutionReg.response.body.data.token;

  const academicianReg = await register("ACADEMICIAN", "Phase10 Faculty");
  assert.equal(academicianReg.response.status, 201);
  const academicianToken = academicianReg.response.body.data.token;

  const industryDash = await request(app)
    .get("/api/industry/dashboard")
    .set(auth(industryToken));
  assert.equal(industryDash.status, 200);
  assert.equal(industryDash.body.data.dashboard.exists, false);

  const institutionDash = await request(app)
    .get("/api/institution/dashboard")
    .set(auth(institutionToken));
  assert.equal(institutionDash.status, 200);
  const analytics = institutionDash.body.data.dashboard;
  assert.equal(analytics.scope, "PLATFORM");
  assert.match(analytics.notice, /Platform-wide anonymized/i);

  const academicianDash = await request(app)
    .get("/api/academician/dashboard")
    .set(auth(academicianToken));
  assert.equal(academicianDash.status, 200);
  assert.equal(academicianDash.body.data.dashboard.collaborationPhase, "upcoming");

  const unauth = await request(app).get("/api/student/dashboard");
  assert.equal(unauth.status, 401);

  assert.equal(
    (await request(app).get("/api/industry/dashboard").set(auth(studentBody.token))).status,
    403,
  );
  assert.equal(
    (await request(app).get("/api/institution/dashboard").set(auth(studentBody.token))).status,
    403,
  );
  assert.equal(
    (await request(app).get("/api/institution/dashboard").set(auth(industryToken))).status,
    403,
  );
  assert.equal(
    (await request(app).get("/api/industry/opportunities").set(auth(academicianToken))).status,
    403,
  );

  const abc = await request(app)
    .post("/api/auth/login")
    .send({ email: "industry.abc@kaushalsetu.demo", password });
  const nova = await request(app)
    .post("/api/auth/login")
    .send({ email: "industry.nova@kaushalsetu.demo", password });
  assert.equal(abc.status, 200);
  assert.equal(nova.status, 200);

  const uniqueStudent = await register("STUDENT", "Phase10 Exclusive Abc", ".exclusive");
  const exclusiveToken = uniqueStudent.response.body.data.token;
  await request(app)
    .post("/api/student/profile")
    .set(auth(exclusiveToken))
    .send({ headline: "Exclusive", location: "Chennai", college: "Test" });
  const skills = await request(app).get("/api/skills").set(auth(exclusiveToken));
  const react = skills.body.data.skills.find((item) => item.name === "React");
  await request(app)
    .post("/api/student/skills")
    .set(auth(exclusiveToken))
    .send({ skillId: react.id, proficiency: 8 });

  const abcList = await request(app)
    .get("/api/industry/opportunities")
    .set(auth(abc.body.data.token));
  const published = abcList.body.data.opportunities.find((item) => item.status === "PUBLISHED");
  const applied = await request(app)
    .post(`/api/opportunities/${published.id}/apply`)
    .set(auth(exclusiveToken))
    .send({ coverLetter: "Exclusive application for ABC only." });
  assert.equal(applied.status, 201, applied.body.message);
  t.after(async () => {
    await prisma.application.deleteMany({ where: { id: applied.body.data.application.id } });
    await prisma.studentSkill.deleteMany({
      where: { profile: { user: { email: uniqueStudent.email } } },
    });
    await prisma.studentProfile.deleteMany({ where: { user: { email: uniqueStudent.email } } });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            studentReg.email,
            industryReg.email,
            institutionReg.email,
            academicianReg.email,
            uniqueStudent.email,
          ],
        },
      },
    });
  });

  const abcDash = await request(app)
    .get("/api/industry/dashboard")
    .set(auth(abc.body.data.token));
  const novaDash = await request(app)
    .get("/api/industry/dashboard")
    .set(auth(nova.body.data.token));
  assert.equal(abcDash.status, 200);
  assert.equal(novaDash.status, 200);
  const abcNames = abcDash.body.data.dashboard.recentApplications.map((item) => item.candidateName);
  const novaNames = [
    ...novaDash.body.data.dashboard.recentApplications.map((item) => item.candidateName),
    ...novaDash.body.data.dashboard.topCandidates.map((item) => item.candidateName),
  ];
  assert.ok(abcNames.includes("Phase10 Exclusive Abc"));
  assert.equal(novaNames.includes("Phase10 Exclusive Abc"), false);
  assert.equal(abcDash.body.data.dashboard.company.companyName.includes("ABC"), true);

  const filledStudent = await request(app)
    .get("/api/student/dashboard")
    .set(auth(exclusiveToken));
  assert.equal(filledStudent.status, 200);
  assert.equal(filledStudent.body.data.dashboard.hasProfile, true);
  assert.equal(filledStudent.body.data.dashboard.metrics.skillsAdded >= 1, true);
  assert.equal(filledStudent.body.data.dashboard.recentApplications.length >= 1, true);

  const privacyHaystack = collectStrings(analytics).join(" ").toLowerCase();
  assert.equal(privacyHaystack.includes("student.a@kaushalsetu.demo"), false);
  assert.equal(privacyHaystack.includes("student.b@kaushalsetu.demo"), false);
  assert.equal(privacyHaystack.includes("ananya sharma"), false);
  assert.equal(
    JSON.stringify(analytics).includes("studentProfileId"),
    false,
  );
  assert.equal(analytics.students, undefined);

  const draftSkill = await prisma.skill.create({
    data: { name: `Phase10 Draft Demand ${suffix}`, category: "TECHNICAL" },
  });
  const closedSkill = await prisma.skill.create({
    data: { name: `Phase10 Closed Demand ${suffix}`, category: "TECHNICAL" },
  });
  const company = await prisma.companyProfile.findFirst({
    where: { user: { email: "industry.abc@kaushalsetu.demo" } },
  });
  const draftOpp = await prisma.opportunity.create({
    data: {
      companyProfileId: company.id,
      title: `Phase10 Draft ${suffix}`,
      description: "Draft demand isolation",
      type: "INTERNSHIP",
      location: "Chennai",
      workMode: "HYBRID",
      status: "DRAFT",
      skills: {
        create: { skillId: draftSkill.id, requiredProficiency: 5, isRequired: true },
      },
    },
  });
  const closedOpp = await prisma.opportunity.create({
    data: {
      companyProfileId: company.id,
      title: `Phase10 Closed ${suffix}`,
      description: "Closed demand isolation",
      type: "JOB",
      location: "Chennai",
      workMode: "ONSITE",
      status: "CLOSED",
      skills: {
        create: { skillId: closedSkill.id, requiredProficiency: 5, isRequired: true },
      },
    },
  });
  t.after(async () => {
    await prisma.opportunity.deleteMany({ where: { id: { in: [draftOpp.id, closedOpp.id] } } });
    await prisma.skill.deleteMany({ where: { id: { in: [draftSkill.id, closedSkill.id] } } });
  });

  const demandDash = await request(app)
    .get("/api/institution/dashboard")
    .set(auth(institutionToken));
  const demandNames = demandDash.body.data.dashboard.industryDemand.map((item) => item.skill);
  const insightNames = demandDash.body.data.dashboard.insights.map((item) => item.skill);
  assert.equal(demandNames.includes(draftSkill.name), false);
  assert.equal(demandNames.includes(closedSkill.name), false);
  assert.equal(insightNames.includes(draftSkill.name), false);
  assert.equal(insightNames.includes(closedSkill.name), false);

  const roadmap = await request(app)
    .get("/api/student/career-roadmap")
    .set(auth(exclusiveToken));
  assert.equal(roadmap.status, 200);
  assert.equal(typeof calculateMatch, "function");
});
