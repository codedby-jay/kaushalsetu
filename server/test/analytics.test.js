import assert from "node:assert/strict";
import test from "node:test";
import { calculateMatch } from "../src/utils/matching.js";
import { readinessFromCareerMatch, PLACEMENT_READY_THRESHOLD } from "../src/utils/readiness.js";
import {
  buildSkillDemandInsight,
  computeCareerSkillGapRates,
  demandLevel,
  proficiencyLevel,
  safePercent,
} from "../src/utils/analytics.js";

test("safePercent never divides by zero", () => {
  assert.equal(safePercent(1, 0), 0);
  assert.equal(safePercent(1, null), 0);
  assert.equal(safePercent(2, 4), 50);
});

test("readiness thresholds match Phase 7 bands", () => {
  assert.equal(readinessFromCareerMatch(false, 90).category, "INSUFFICIENT_DATA");
  assert.equal(readinessFromCareerMatch(false, 90).percentage, null);
  assert.equal(readinessFromCareerMatch(false, 0).available, false);

  assert.equal(readinessFromCareerMatch(true, 80).category, "READY");
  assert.equal(readinessFromCareerMatch(true, 79).category, "ALMOST_READY");
  assert.equal(readinessFromCareerMatch(true, 60).category, "ALMOST_READY");
  assert.equal(readinessFromCareerMatch(true, 59).category, "DEVELOPING");
  assert.equal(readinessFromCareerMatch(true, 40).category, "DEVELOPING");
  assert.equal(readinessFromCareerMatch(true, 39).category, "NEEDS_ATTENTION");
  assert.equal(readinessFromCareerMatch(true, 0).category, "NEEDS_ATTENTION");
  assert.equal(readinessFromCareerMatch(true, 0).percentage, 0);
  assert.equal(PLACEMENT_READY_THRESHOLD, 60);
  assert.equal(readinessFromCareerMatch(true, 60).placementReady, true);
  assert.equal(readinessFromCareerMatch(true, 59).placementReady, false);
});

test("career goal with zero skills is 0% Needs Attention via calculateMatch", () => {
  const match = calculateMatch(
    [],
    [{ skillId: "java", name: "Java", requiredProficiency: 7, isRequired: true }],
  );
  const readiness = readinessFromCareerMatch(true, match.matchPercentage);
  assert.equal(match.matchPercentage, 0);
  assert.equal(readiness.category, "NEEDS_ATTENTION");
});

test("demand and proficiency levels", () => {
  assert.equal(demandLevel(0, 10), "LOW");
  assert.equal(demandLevel(2, 0), "LOW");
  assert.equal(demandLevel(4, 10), "HIGH");
  assert.equal(demandLevel(2, 10), "MEDIUM");
  assert.equal(demandLevel(1, 10), "LOW");
  assert.equal(proficiencyLevel(7), "HIGH");
  assert.equal(proficiencyLevel(4), "MEDIUM");
  assert.equal(proficiencyLevel(3.9), "LOW");
});

test("skill demand insight rules are explainable", () => {
  const significant = buildSkillDemandInsight({
    skillName: "Spring Boot",
    demand: "HIGH",
    proficiency: "LOW",
  });
  assert.equal(significant.gap, "Significant");
  assert.equal(significant.recommendedAction, "Industry-oriented Spring Boot training");
  assert.match(significant.summary, /highly demanded/);
  assert.match(significant.summary, /low/);

  assert.equal(
    buildSkillDemandInsight({ skillName: "SQL", demand: "HIGH", proficiency: "MEDIUM" }).gap,
    "Notable",
  );
  assert.equal(
    buildSkillDemandInsight({ skillName: "Git", demand: "HIGH", proficiency: "HIGH" }).gap,
    "Aligned",
  );
  assert.equal(
    buildSkillDemandInsight({ skillName: "C++", demand: "LOW", proficiency: "LOW" }).gap,
    "Low priority",
  );
});

test("gap rate treats missing StudentSkill as proficiency 0", () => {
  const rows = computeCareerSkillGapRates([
    {
      skills: [],
      careerGoal: {
        careerRole: {
          isActive: true,
          skills: [
            {
              skillId: "spring",
              requiredProficiency: 7,
              skill: { name: "Spring Boot" },
            },
          ],
        },
      },
    },
    {
      skills: [{ skillId: "spring", proficiency: 8 }],
      careerGoal: {
        careerRole: {
          isActive: true,
          skills: [
            {
              skillId: "spring",
              requiredProficiency: 7,
              skill: { name: "Spring Boot" },
            },
          ],
        },
      },
    },
    {
      skills: [],
      careerGoal: null,
    },
  ]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].skill, "Spring Boot");
  assert.equal(rows[0].students, 2);
  assert.equal(rows[0].withGap, 1);
  assert.equal(rows[0].gapRatePercent, 50);
});
