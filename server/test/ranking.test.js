import assert from "node:assert/strict";
import test from "node:test";
import { calculateMatch } from "../src/utils/matching.js";
import {
  assignFitRanks,
  buildRankingMetadata,
  compareByFit,
  rankCandidates,
  requiredSkillCoverageFromMatch,
} from "../src/utils/ranking.js";

test("required skill coverage uses MATCHED required skills only", () => {
  const match = calculateMatch(
    [
      { skillId: "a", proficiency: 8 },
      { skillId: "b", proficiency: 4 },
    ],
    [
      { skillId: "a", name: "React", requiredProficiency: 6, isRequired: true },
      { skillId: "b", name: "SQL", requiredProficiency: 8, isRequired: true },
      { skillId: "c", name: "Git", requiredProficiency: 5, isRequired: false },
    ],
  );
  const coverage = requiredSkillCoverageFromMatch(match);
  assert.equal(coverage.requiredCount, 2);
  assert.equal(coverage.coveredRequiredCount, 1);
  assert.equal(coverage.requiredSkillCoverage, 50);
});

test("opportunity with no required skills does not divide by zero", () => {
  const empty = calculateMatch([], []);
  const coverage = requiredSkillCoverageFromMatch(empty);
  assert.equal(coverage.requiredCount, 0);
  assert.equal(coverage.requiredSkillCoverage, 100);
  assert.equal(buildRankingMetadata(empty).totalSkillGap, 0);

  const optionalOnly = calculateMatch(
    [{ skillId: "a", proficiency: 3 }],
    [{ skillId: "a", name: "Git", requiredProficiency: 5, isRequired: false }],
  );
  const optionalCoverage = requiredSkillCoverageFromMatch(optionalOnly);
  assert.equal(optionalCoverage.requiredCount, 0);
  assert.equal(optionalCoverage.requiredSkillCoverage, 100);
});

test("higher match score ranks first", () => {
  const ordered = rankCandidates([
    {
      id: "low",
      matchPercentage: 40,
      requiredSkillCoverage: 100,
      totalSkillGap: 0,
      appliedAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "high",
      matchPercentage: 90,
      requiredSkillCoverage: 0,
      totalSkillGap: 20,
      appliedAt: "2026-09-05T00:00:00.000Z",
    },
  ]);
  assert.deepEqual(
    ordered.map((item) => item.id),
    ["high", "low"],
  );
  assert.equal(ordered[0].rank, 1);
  assert.equal(ordered[1].rank, 2);
});

test("tie-breaker uses required skill coverage", () => {
  const a = {
    id: "cover",
    matchPercentage: 80,
    requiredSkillCoverage: 80,
    totalSkillGap: 8,
    appliedAt: "2026-09-05T00:00:00.000Z",
  };
  const b = {
    id: "gaps",
    matchPercentage: 80,
    requiredSkillCoverage: 40,
    totalSkillGap: 2,
    appliedAt: "2026-09-01T00:00:00.000Z",
  };
  assert.ok(compareByFit(a, b) < 0);
  assert.equal(rankCandidates([b, a])[0].id, "cover");
});

test("remaining tie-breaker uses total skill gap", () => {
  const a = {
    id: "smaller-gap",
    matchPercentage: 70,
    requiredSkillCoverage: 50,
    totalSkillGap: 3,
    appliedAt: "2026-09-05T00:00:00.000Z",
  };
  const b = {
    id: "larger-gap",
    matchPercentage: 70,
    requiredSkillCoverage: 50,
    totalSkillGap: 9,
    appliedAt: "2026-09-01T00:00:00.000Z",
  };
  assert.equal(rankCandidates([b, a])[0].id, "smaller-gap");
});

test("final tie-breaker uses earlier application date", () => {
  const earlier = {
    id: "earlier",
    matchPercentage: 70,
    requiredSkillCoverage: 50,
    totalSkillGap: 4,
    appliedAt: "2026-09-01T00:00:00.000Z",
  };
  const later = {
    id: "later",
    matchPercentage: 70,
    requiredSkillCoverage: 50,
    totalSkillGap: 4,
    appliedAt: "2026-09-04T00:00:00.000Z",
  };
  assert.equal(rankCandidates([later, earlier])[0].id, "earlier");
});

test("fit rank stays stable when sorting by applied date", () => {
  const items = [
    {
      id: "best",
      matchPercentage: 90,
      requiredSkillCoverage: 100,
      totalSkillGap: 0,
      appliedAt: "2026-09-05T00:00:00.000Z",
    },
    {
      id: "older",
      matchPercentage: 40,
      requiredSkillCoverage: 20,
      totalSkillGap: 12,
      appliedAt: "2026-09-01T00:00:00.000Z",
    },
  ];
  const newest = rankCandidates(items, "applied_newest");
  assert.equal(newest[0].id, "best");
  assert.equal(newest.find((item) => item.id === "best").rank, 1);
  assert.equal(newest.find((item) => item.id === "older").rank, 2);
});

test("assignFitRanks does not persist or invent a second score", () => {
  const ranked = assignFitRanks([
    {
      id: "a",
      matchPercentage: 55,
      requiredSkillCoverage: 50,
      totalSkillGap: 4,
      appliedAt: "2026-09-01T00:00:00.000Z",
    },
  ]);
  assert.equal(ranked[0].matchPercentage, 55);
  assert.equal(ranked[0].rank, 1);
  assert.equal(Object.hasOwn(ranked[0], "aiScore"), false);
});
