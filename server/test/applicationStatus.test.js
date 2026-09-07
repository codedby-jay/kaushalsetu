import assert from "node:assert/strict";
import test from "node:test";
import {
  allowedIndustryTransitions,
  canStudentWithdraw,
  isValidIndustryTransition,
} from "../src/utils/application.js";
import { calculateMatch, REQUIRED_WEIGHT, OPTIONAL_WEIGHT } from "../src/utils/matching.js";

test("industry cannot move terminal statuses backward", () => {
  assert.deepEqual(allowedIndustryTransitions("SELECTED"), []);
  assert.deepEqual(allowedIndustryTransitions("REJECTED"), []);
  assert.deepEqual(allowedIndustryTransitions("WITHDRAWN"), []);
  assert.equal(isValidIndustryTransition("REJECTED", "SHORTLISTED"), false);
  assert.equal(isValidIndustryTransition("APPLIED", "SHORTLISTED"), false);
  assert.equal(isValidIndustryTransition("APPLIED", "UNDER_REVIEW"), true);
  assert.equal(isValidIndustryTransition("UNDER_REVIEW", "SHORTLISTED"), true);
  assert.equal(isValidIndustryTransition("UNDER_REVIEW", "REJECTED"), true);
});

test("students can withdraw only early statuses", () => {
  assert.equal(canStudentWithdraw("APPLIED"), true);
  assert.equal(canStudentWithdraw("UNDER_REVIEW"), true);
  assert.equal(canStudentWithdraw("SHORTLISTED"), true);
  assert.equal(canStudentWithdraw("INTERVIEW"), false);
  assert.equal(canStudentWithdraw("SELECTED"), false);
  assert.equal(canStudentWithdraw("REJECTED"), false);
  assert.equal(canStudentWithdraw("WITHDRAWN"), false);
});

test("Phase 6 matching formula is unchanged", () => {
  assert.equal(REQUIRED_WEIGHT, 1);
  assert.equal(OPTIONAL_WEIGHT, 0.5);
  const result = calculateMatch(
    [
      { skillId: "a", proficiency: 8 },
      { skillId: "b", proficiency: 4 },
    ],
    [
      { skillId: "a", name: "React", requiredProficiency: 8, isRequired: true },
      { skillId: "b", name: "SQL", requiredProficiency: 8, isRequired: true },
    ],
  );
  assert.equal(result.matchPercentage, 75);
  assert.equal(result.matchedSkills.length, 1);
  assert.equal(result.skillGaps.length, 1);
});
