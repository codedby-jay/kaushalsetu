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

async function login(email) {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  assert.equal(response.status, 200, response.body.message);
  return response.body.data.token;
}

async function registerStudent(email, name) {
  const created = await request(app).post("/api/auth/register").send({
    name,
    email,
    password,
    role: "STUDENT",
  });
  assert.equal(created.status, 201, created.body.message);
  return login(email);
}

async function createProfile(token, extra = {}) {
  const response = await request(app)
    .post("/api/student/profile")
    .set(auth(token))
    .send({
      headline: "Test student",
      location: "Chennai",
      college: "Test College",
      ...extra,
    });
  assert.equal(response.status, 201, response.body.message);
  return response.body.data.profile;
}

test("application lifecycle, ownership, matching, and regressions", async (t) => {
  const industryAbc = await login("industry.abc@kaushalsetu.demo");
  const industryNova = await login("industry.nova@kaushalsetu.demo");
  const studentA = await registerStudent(`phase8.a.${suffix}@kaushalsetu.test`, "Phase8 Student A");
  const studentB = await registerStudent(`phase8.b.${suffix}@kaushalsetu.test`, "Phase8 Student B");

  const skillsResponse = await request(app).get("/api/skills").set(auth(studentA));
  assert.equal(skillsResponse.status, 200);
  const catalog = skillsResponse.body.data.skills;
  const react = catalog.find((item) => item.name === "React");
  const node = catalog.find((item) => item.name === "Node.js");
  assert.ok(react && node);

  const createdOpp = await request(app)
    .post("/api/industry/opportunities")
    .set(auth(industryAbc))
    .send({
      title: `Phase 8 Test Intern ${suffix}`,
      description: "Temporary listing used by Phase 8 automated tests.",
      type: "INTERNSHIP",
      location: "Chennai",
      workMode: "HYBRID",
      duration: "3 months",
      stipend: 15000,
      skills: [
        { skillId: react.id, requiredProficiency: 6, isRequired: true },
        { skillId: node.id, requiredProficiency: 5, isRequired: true },
      ],
    });
  assert.equal(createdOpp.status, 201, createdOpp.body.message);
  const opportunityId = createdOpp.body.data.opportunity.id;
  t.after(async () => {
    await prisma.application.deleteMany({ where: { opportunityId } });
    await prisma.opportunity.delete({ where: { id: opportunityId } }).catch(() => {});
  });

  const published = await request(app)
    .patch(`/api/industry/opportunities/${opportunityId}/publish`)
    .set(auth(industryAbc));
  assert.equal(published.status, 200, published.body.message);

  const abcList = await request(app).get("/api/industry/opportunities").set(auth(industryAbc));
  const draft = abcList.body.data.opportunities.find((item) => item.status === "DRAFT");
  const closed = abcList.body.data.opportunities.find((item) => item.status === "CLOSED");
  assert.ok(draft, "seed draft opportunity");
  assert.ok(closed, "seed closed opportunity");

  await t.test("student cannot apply without StudentProfile", async () => {
    const response = await request(app)
      .post(`/api/opportunities/${opportunityId}/apply`)
      .set(auth(studentA))
      .send({ coverLetter: "Hello" });
    assert.equal(response.status, 400);
  });

  await createProfile(studentA);
  await createProfile(studentB);

  await request(app)
    .post("/api/student/skills")
    .set(auth(studentA))
    .send({ skillId: react.id, proficiency: 8 });
  await request(app)
    .post("/api/student/skills")
    .set(auth(studentA))
    .send({ skillId: node.id, proficiency: 6 });

  await t.test("student cannot apply to draft opportunity", async () => {
    const response = await request(app)
      .post(`/api/opportunities/${draft.id}/apply`)
      .set(auth(studentA))
      .send({ coverLetter: "Draft" });
    assert.equal(response.status, 404);
  });

  await t.test("student cannot apply to closed opportunity", async () => {
    const response = await request(app)
      .post(`/api/opportunities/${closed.id}/apply`)
      .set(auth(studentA))
      .send({ coverLetter: "Closed" });
    assert.equal(response.status, 409);
  });

  let applicationId;
  await t.test("student can apply to published opportunity", async () => {
    const response = await request(app)
      .post(`/api/opportunities/${opportunityId}/apply`)
      .set(auth(studentA))
      .send({
        coverLetter: "I would like to join this internship.",
        studentProfileId: "should-be-ignored",
      });
    assert.equal(response.status, 400);
    const valid = await request(app)
      .post(`/api/opportunities/${opportunityId}/apply`)
      .set(auth(studentA))
      .send({ coverLetter: "I would like to join this internship." });
    assert.equal(valid.status, 201, valid.body.message);
    assert.equal(valid.body.data.application.status, "APPLIED");
    assert.equal(valid.body.data.application.match.matchPercentage >= 0, true);
    applicationId = valid.body.data.application.id;
  });

  await t.test("duplicate application returns 409", async () => {
    const response = await request(app)
      .post(`/api/opportunities/${opportunityId}/apply`)
      .set(auth(studentA))
      .send({ coverLetter: "Again" });
    assert.equal(response.status, 409);
  });

  await t.test("student can see own applications", async () => {
    const response = await request(app).get("/api/student/applications").set(auth(studentA));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.applications.some((item) => item.id === applicationId), true);
  });

  await t.test("student cannot see another student's application", async () => {
    const response = await request(app)
      .get(`/api/student/applications/${applicationId}`)
      .set(auth(studentB));
    assert.equal(response.status, 404);
  });

  await t.test("industry can see applications for own opportunity", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.applications.length, 1);
    assert.equal(response.body.data.applications[0].id, applicationId);
    assert.ok(response.body.data.applications[0].match);
  });

  await t.test("industry cannot see applications for another company's opportunity", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryNova));
    assert.equal(response.status, 404);
    const detail = await request(app)
      .get(`/api/industry/applications/${applicationId}`)
      .set(auth(industryNova));
    assert.equal(detail.status, 404);
  });

  await t.test("match score in application view uses Phase 6 matching", async () => {
    const detail = await request(app)
      .get(`/api/industry/applications/${applicationId}`)
      .set(auth(industryAbc));
    assert.equal(detail.status, 200);
    const expected = calculateMatch(
      [
        { skillId: react.id, proficiency: 8 },
        { skillId: node.id, proficiency: 6 },
      ],
      [
        { skillId: react.id, name: "React", requiredProficiency: 6, isRequired: true },
        { skillId: node.id, name: "Node.js", requiredProficiency: 5, isRequired: true },
      ],
    );
    assert.equal(detail.body.data.application.match.matchPercentage, expected.matchPercentage);
  });

  await t.test("industry can update valid application status", async () => {
    const response = await request(app)
      .patch(`/api/industry/applications/${applicationId}/status`)
      .set(auth(industryAbc))
      .send({ status: "UNDER_REVIEW" });
    assert.equal(response.status, 200, response.body.message);
    assert.equal(response.body.data.application.status, "UNDER_REVIEW");
  });

  await t.test("industry cannot perform invalid status transition", async () => {
    const response = await request(app)
      .patch(`/api/industry/applications/${applicationId}/status`)
      .set(auth(industryAbc))
      .send({ status: "SELECTED" });
    assert.equal(response.status, 400);
  });

  await t.test("student cannot change application status", async () => {
    const response = await request(app)
      .patch(`/api/industry/applications/${applicationId}/status`)
      .set(auth(studentA))
      .send({ status: "SHORTLISTED" });
    assert.equal(response.status, 403);
  });

  await t.test("industry cannot withdraw application as student", async () => {
    const response = await request(app)
      .patch(`/api/student/applications/${applicationId}/withdraw`)
      .set(auth(industryAbc));
    assert.equal(response.status, 403);
  });

  await t.test("student can withdraw an eligible application", async () => {
    const response = await request(app)
      .patch(`/api/student/applications/${applicationId}/withdraw`)
      .set(auth(studentA));
    assert.equal(response.status, 200, response.body.message);
    assert.equal(response.body.data.application.status, "WITHDRAWN");
  });

  await t.test("student cannot withdraw terminal application", async () => {
    const response = await request(app)
      .patch(`/api/student/applications/${applicationId}/withdraw`)
      .set(auth(studentA));
    assert.equal(response.status, 409);
  });

  await t.test("existing opportunity matching still works", async () => {
    const listed = await request(app).get("/api/opportunities").set(auth(studentA));
    assert.equal(listed.status, 200);
    const match = await request(app)
      .get(`/api/opportunities/${opportunityId}/match`)
      .set(auth(studentA));
    assert.equal(match.status, 200);
    assert.equal(typeof match.body.data.match.matchPercentage, "number");
  });

  await t.test("existing career roadmap still works", async () => {
    const roles = await request(app).get("/api/career-roles").set(auth(studentA));
    assert.equal(roles.status, 200);
    assert.ok(Array.isArray(roles.body.data.roles));
    const roadmap = await request(app).get("/api/student/career-roadmap").set(auth(studentA));
    assert.equal(roadmap.status, 200);
    assert.equal(roadmap.body.data.exists, false);
  });

  await t.test("existing assessment system still works", async () => {
    const response = await request(app).get("/api/assessments").set(auth(studentA));
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data.assessments));
  });

  await t.test("existing opportunity publishing remains intact", async () => {
    const unpublished = await request(app)
      .patch(`/api/industry/opportunities/${opportunityId}/unpublish`)
      .set(auth(industryAbc));
    assert.equal(unpublished.status, 200, unpublished.body.message);
    const republished = await request(app)
      .patch(`/api/industry/opportunities/${opportunityId}/publish`)
      .set(auth(industryAbc));
    assert.equal(republished.status, 200, republished.body.message);
    await request(app)
      .patch(`/api/industry/opportunities/${opportunityId}/close`)
      .set(auth(industryAbc));
  });
});
