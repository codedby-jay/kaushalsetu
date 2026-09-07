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
      headline: extra.headline || "Ranking test student",
      location: extra.location || "Chennai",
      college: extra.college || "Test College",
      ...extra,
    });
  assert.equal(response.status, 201, response.body.message);
  return response.body.data.profile;
}

async function addSkill(token, skillId, proficiency) {
  const response = await request(app)
    .post("/api/student/skills")
    .set(auth(token))
    .send({ skillId, proficiency });
  assert.equal(response.status, 201, response.body.message);
}

test("industry candidate ranking, filters, ownership, and empty states", async (t) => {
  const industryAbc = await login("industry.abc@kaushalsetu.demo");
  const industryNova = await login("industry.nova@kaushalsetu.demo");
  const high = await registerStudent(`phase9.high.${suffix}@kaushalsetu.test`, "Phase9 High Match");
  const cover = await registerStudent(`phase9.cover.${suffix}@kaushalsetu.test`, "Phase9 Coverage Lead");
  const partial = await registerStudent(`phase9.partial.${suffix}@kaushalsetu.test`, "Phase9 Partial Match");
  const early = await registerStudent(`phase9.early.${suffix}@kaushalsetu.test`, "Phase9 Early Applicant");
  const late = await registerStudent(`phase9.late.${suffix}@kaushalsetu.test`, "Phase9 Late Applicant");
  const outsider = await registerStudent(`phase9.out.${suffix}@kaushalsetu.test`, "Phase9 Outsider");

  const skillsResponse = await request(app).get("/api/skills").set(auth(high));
  assert.equal(skillsResponse.status, 200);
  const catalog = skillsResponse.body.data.skills;
  const react = catalog.find((item) => item.name === "React");
  const node = catalog.find((item) => item.name === "Node.js");
  assert.ok(react && node);

  await createProfile(high, { headline: "Strong React developer" });
  await createProfile(cover, { headline: "Coverage-focused applicant" });
  await createProfile(partial, { headline: "Even partial skills" });
  await createProfile(early, { headline: "Same skills earlier" });
  await createProfile(late, { headline: "Same skills later" });
  await createProfile(outsider);

  await addSkill(high, react.id, 9);
  await addSkill(high, node.id, 8);
  await addSkill(cover, react.id, 5);
  await addSkill(cover, node.id, 3);
  await addSkill(partial, react.id, 4);
  await addSkill(partial, node.id, 4);
  await addSkill(early, react.id, 2);
  await addSkill(early, node.id, 2);
  await addSkill(late, react.id, 2);
  await addSkill(late, node.id, 2);

  const createdOpp = await request(app)
    .post("/api/industry/opportunities")
    .set(auth(industryAbc))
    .send({
      title: `Phase 9 Ranking Intern ${suffix}`,
      description: "Temporary listing used by Phase 9 ranking tests.",
      type: "INTERNSHIP",
      location: "Chennai",
      workMode: "HYBRID",
      duration: "3 months",
      stipend: 15000,
      skills: [
        { skillId: react.id, requiredProficiency: 5, isRequired: true },
        { skillId: node.id, requiredProficiency: 5, isRequired: true },
      ],
    });
  assert.equal(createdOpp.status, 201, createdOpp.body.message);
  const opportunityId = createdOpp.body.data.opportunity.id;

  const emptyOpp = await request(app)
    .post("/api/industry/opportunities")
    .set(auth(industryAbc))
    .send({
      title: `Phase 9 Empty Intern ${suffix}`,
      description: "No applicants.",
      type: "INTERNSHIP",
      location: "Chennai",
      workMode: "REMOTE",
      skills: [{ skillId: react.id, requiredProficiency: 5, isRequired: true }],
    });
  assert.equal(emptyOpp.status, 201, emptyOpp.body.message);
  const emptyOpportunityId = emptyOpp.body.data.opportunity.id;

  const optionalOpp = await request(app)
    .post("/api/industry/opportunities")
    .set(auth(industryAbc))
    .send({
      title: `Phase 9 Optional Skills Intern ${suffix}`,
      description: "Published listing with only optional skills.",
      type: "INTERNSHIP",
      location: "Chennai",
      workMode: "REMOTE",
      skills: [{ skillId: node.id, requiredProficiency: 5, isRequired: false }],
    });
  assert.equal(optionalOpp.status, 201, optionalOpp.body.message);
  const optionalOpportunityId = optionalOpp.body.data.opportunity.id;

  t.after(async () => {
    await prisma.application.deleteMany({
      where: { opportunityId: { in: [opportunityId, emptyOpportunityId, optionalOpportunityId] } },
    });
    await prisma.opportunity.deleteMany({
      where: { id: { in: [opportunityId, emptyOpportunityId, optionalOpportunityId] } },
    });
  });

  const published = await request(app)
    .patch(`/api/industry/opportunities/${opportunityId}/publish`)
    .set(auth(industryAbc));
  assert.equal(published.status, 200, published.body.message);
  const publishedOptional = await request(app)
    .patch(`/api/industry/opportunities/${optionalOpportunityId}/publish`)
    .set(auth(industryAbc));
  assert.equal(publishedOptional.status, 200, publishedOptional.body.message);

  const apply = async (token, letter) => {
    const response = await request(app)
      .post(`/api/opportunities/${opportunityId}/apply`)
      .set(auth(token))
      .send({ coverLetter: letter });
    assert.equal(response.status, 201, response.body.message);
    return response.body.data.application;
  };

  const highApp = await apply(high, "High match");
  const coverApp = await apply(cover, "Coverage lead");
  const partialApp = await apply(partial, "Partial");
  const earlyApp = await apply(early, "Early");
  const lateApp = await apply(late, "Late");

  await prisma.application.update({
    where: { id: earlyApp.id },
    data: { appliedAt: new Date("2026-09-01T08:00:00.000Z") },
  });
  await prisma.application.update({
    where: { id: lateApp.id },
    data: { appliedAt: new Date("2026-09-04T08:00:00.000Z") },
  });

  await t.test("industry can retrieve ranked applicants for own opportunity", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.applications.length, 5);
    assert.equal(response.body.data.meta.sort, "match_desc");
    assert.ok(response.body.data.applications[0].ranking.rank >= 1);
  });

  await t.test("candidates sorted by match score descending by default", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    const scores = response.body.data.applications.map((item) => item.match.matchPercentage);
    const sorted = [...scores].sort((a, b) => b - a);
    assert.deepEqual(scores, sorted);
    assert.equal(response.body.data.applications[0].id, highApp.id);
    assert.equal(response.body.data.applications[0].ranking.rank, 1);
  });

  await t.test("higher match score ranks first", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    const first = response.body.data.applications[0];
    assert.equal(first.applicant.name, "Phase9 High Match");
    assert.ok(first.match.matchPercentage > response.body.data.applications[1].match.matchPercentage);
  });

  await t.test("tie-breaker uses required skill coverage", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    const coverRow = response.body.data.applications.find((item) => item.id === coverApp.id);
    const partialRow = response.body.data.applications.find((item) => item.id === partialApp.id);
    assert.equal(coverRow.match.matchPercentage, partialRow.match.matchPercentage);
    assert.ok(coverRow.ranking.requiredSkillCoverage > partialRow.ranking.requiredSkillCoverage);
    assert.ok(coverRow.ranking.rank < partialRow.ranking.rank);
  });

  await t.test("final tie-breaker uses application date", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    const earlyRow = response.body.data.applications.find((item) => item.id === earlyApp.id);
    const lateRow = response.body.data.applications.find((item) => item.id === lateApp.id);
    assert.equal(earlyRow.match.matchPercentage, lateRow.match.matchPercentage);
    assert.equal(earlyRow.ranking.requiredSkillCoverage, lateRow.ranking.requiredSkillCoverage);
    assert.ok(earlyRow.ranking.rank < lateRow.ranking.rank);
  });

  await t.test("status filtering works", async () => {
    const moved = await request(app)
      .patch(`/api/industry/applications/${highApp.id}/status`)
      .set(auth(industryAbc))
      .send({ status: "UNDER_REVIEW" });
    assert.equal(moved.status, 200);
    const shortlist = await request(app)
      .patch(`/api/industry/applications/${highApp.id}/status`)
      .set(auth(industryAbc))
      .send({ status: "SHORTLISTED" });
    assert.equal(shortlist.status, 200);

    const filtered = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .query({ status: "SHORTLISTED" })
      .set(auth(industryAbc));
    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.data.applications.length, 1);
    assert.equal(filtered.body.data.applications[0].id, highApp.id);
  });

  await t.test("search works on candidate name", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .query({ search: "Coverage Lead" })
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.applications.length, 1);
    assert.equal(response.body.data.applications[0].id, coverApp.id);
  });

  await t.test("minMatch filters after Phase 6 scoring", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .query({ minMatch: 90 })
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.ok(response.body.data.applications.length >= 1);
    for (const item of response.body.data.applications) {
      assert.ok(item.match.matchPercentage >= 90);
    }
  });

  await t.test("match score uses Phase 6 calculateMatch", async () => {
    const detail = await request(app)
      .get(`/api/industry/applications/${highApp.id}`)
      .set(auth(industryAbc));
    assert.equal(detail.status, 200);
    const expected = calculateMatch(
      [
        { skillId: react.id, proficiency: 9 },
        { skillId: node.id, proficiency: 8 },
      ],
      [
        { skillId: react.id, name: "React", requiredProficiency: 5, isRequired: true },
        { skillId: node.id, name: "Node.js", requiredProficiency: 5, isRequired: true },
      ],
    );
    assert.equal(detail.body.data.application.match.matchPercentage, expected.matchPercentage);
    assert.equal(detail.body.data.application.ranking.requiredSkillCoverage, 100);
  });

  await t.test("ranking does not persist a second score", async () => {
    const listed = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    const row = listed.body.data.applications[0];
    assert.equal(Object.hasOwn(row, "aiScore"), false);
    assert.equal(Object.hasOwn(row.match, "aiScore"), false);
    const stored = await prisma.application.findUnique({ where: { id: row.id } });
    assert.equal(Object.hasOwn(stored, "matchScore"), false);
    assert.equal(Object.hasOwn(stored, "rank"), false);
  });

  await t.test("another company cannot access candidates", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryNova));
    assert.equal(response.status, 404);
  });

  await t.test("student cannot access industry ranking", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(outsider));
    assert.equal(response.status, 403);
  });

  await t.test("withdrawn candidates are excluded by default and visible when requested", async () => {
    const withdrawn = await request(app)
      .patch(`/api/student/applications/${partialApp.id}/withdraw`)
      .set(auth(partial));
    assert.equal(withdrawn.status, 200);

    const active = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .set(auth(industryAbc));
    assert.equal(
      active.body.data.applications.some((item) => item.id === partialApp.id),
      false,
    );

    const withdrawnOnly = await request(app)
      .get(`/api/industry/opportunities/${opportunityId}/applications`)
      .query({ status: "WITHDRAWN" })
      .set(auth(industryAbc));
    assert.equal(withdrawnOnly.body.data.applications.length, 1);
    assert.equal(withdrawnOnly.body.data.applications[0].id, partialApp.id);
  });

  await t.test("opportunity with no applicants works", async () => {
    const response = await request(app)
      .get(`/api/industry/opportunities/${emptyOpportunityId}/applications`)
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data.applications, []);
  });

  await t.test("opportunity with no required skills does not crash", async () => {
    const applyEmpty = await request(app)
      .post(`/api/opportunities/${optionalOpportunityId}/apply`)
      .set(auth(outsider))
      .send({ coverLetter: "Optional skills only" });
    assert.equal(applyEmpty.status, 201, applyEmpty.body.message);

    const response = await request(app)
      .get(`/api/industry/opportunities/${optionalOpportunityId}/applications`)
      .set(auth(industryAbc));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.applications.length, 1);
    assert.equal(response.body.data.applications[0].ranking.requiredCount, 0);
    assert.equal(response.body.data.applications[0].ranking.requiredSkillCoverage, 100);
  });

  await t.test("existing Phase 8 status transitions remain valid", async () => {
    const invalid = await request(app)
      .patch(`/api/industry/applications/${coverApp.id}/status`)
      .set(auth(industryAbc))
      .send({ status: "SELECTED" });
    assert.equal(invalid.status, 400);
    const valid = await request(app)
      .patch(`/api/industry/applications/${coverApp.id}/status`)
      .set(auth(industryAbc))
      .send({ status: "UNDER_REVIEW" });
    assert.equal(valid.status, 200);
    assert.equal(valid.body.data.application.status, "UNDER_REVIEW");
  });

  await t.test("existing Phase 6 matching tests still pass", async () => {
    const listed = await request(app).get("/api/opportunities").set(auth(high));
    assert.equal(listed.status, 200);
    const match = await request(app)
      .get(`/api/opportunities/${opportunityId}/match`)
      .set(auth(high));
    assert.equal(match.status, 200);
    assert.equal(typeof match.body.data.match.matchPercentage, "number");
  });

  await t.test("existing Phase 7 career roadmap tests still pass", async () => {
    const roles = await request(app).get("/api/career-roles").set(auth(high));
    assert.equal(roles.status, 200);
    const roadmap = await request(app).get("/api/student/career-roadmap").set(auth(high));
    assert.equal(roadmap.status, 200);
  });

  await t.test("existing assessment tests still pass", async () => {
    const response = await request(app).get("/api/assessments").set(auth(high));
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data.assessments));
  });

  await t.test("existing opportunity publishing tests still pass", async () => {
    const unpublished = await request(app)
      .patch(`/api/industry/opportunities/${opportunityId}/unpublish`)
      .set(auth(industryAbc));
    assert.equal(unpublished.status, 200, unpublished.body.message);
    const republished = await request(app)
      .patch(`/api/industry/opportunities/${opportunityId}/publish`)
      .set(auth(industryAbc));
    assert.equal(republished.status, 200, republished.body.message);
  });
});
