import { prisma } from "../config/prisma.js";
import { calculateMatch } from "../utils/matching.js";
import { readinessFromCareerMatch, emptyReadinessDistribution } from "../utils/readiness.js";
import {
  buildSkillDemandInsight,
  computeCareerSkillGapRates,
  demandLevel,
  proficiencyLevel,
  safePercent,
} from "../utils/analytics.js";

const TOP_LIMIT = 8;
const INSIGHT_LIMIT = 8;

function average(values) {
  if (!values.length) {
    return null;
  }
  return Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) / 10;
}

export async function getInstitutionAnalytics() {
  const [
    totalStudents,
    assessedGroups,
    publishedCount,
    activeInternships,
    applicationTotal,
    selectedGroups,
    pipelineGroups,
    demandGroups,
    students,
    skills,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.assessmentAttempt.groupBy({
      by: ["studentProfileId"],
      where: { status: "SUBMITTED" },
    }),
    prisma.opportunity.count({ where: { status: "PUBLISHED" } }),
    prisma.opportunity.count({
      where: { status: "PUBLISHED", type: "INTERNSHIP" },
    }),
    prisma.application.count({
      where: { status: { not: "WITHDRAWN" } },
    }),
    prisma.application.groupBy({
      by: ["studentProfileId"],
      where: { status: "SELECTED" },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.opportunitySkill.groupBy({
      by: ["skillId"],
      where: { opportunity: { status: "PUBLISHED" } },
      _count: { opportunityId: true },
    }),
    prisma.studentProfile.findMany({
      select: {
        skills: {
          select: {
            skillId: true,
            proficiency: true,
          },
        },
        careerGoal: {
          select: {
            careerRole: {
              select: {
                isActive: true,
                skills: {
                  select: {
                    skillId: true,
                    requiredProficiency: true,
                    isRequired: true,
                    skill: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.skill.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const skillNameById = new Map(skills.map((item) => [item.id, item.name]));
  const assessedStudents = assessedGroups.length;
  const selectedStudents = selectedGroups.length;

  const distribution = emptyReadinessDistribution();
  const readinessScores = [];

  for (const student of students) {
    const role = student.careerGoal?.careerRole;
    const hasGoal = Boolean(role?.isActive);
    if (!hasGoal) {
      distribution.INSUFFICIENT_DATA += 1;
      continue;
    }

    const match = calculateMatch(
      student.skills,
      (role.skills || []).map((item) => ({
        skillId: item.skillId,
        name: item.skill?.name,
        requiredProficiency: item.requiredProficiency,
        isRequired: item.isRequired,
      })),
    );
    const readiness = readinessFromCareerMatch(true, match.matchPercentage);
    distribution[readiness.category] += 1;
    readinessScores.push(readiness.percentage);
  }

  const placementReady =
    distribution.READY + distribution.ALMOST_READY;
  const averageIndustryReadiness =
    readinessScores.length === 0
      ? null
      : Math.round(
          readinessScores.reduce((sum, item) => sum + item, 0) / readinessScores.length,
        );

  const skillGaps = computeCareerSkillGapRates(students).slice(0, TOP_LIMIT);

  const industryDemand = demandGroups
    .map((row) => ({
      skillId: row.skillId,
      skill: skillNameById.get(row.skillId) || "Skill",
      opportunityCount: row._count.opportunityId,
    }))
    .sort(
      (a, b) =>
        b.opportunityCount - a.opportunityCount || a.skill.localeCompare(b.skill),
    )
    .slice(0, TOP_LIMIT)
    .map(({ skillId: _skillId, ...rest }) => rest);

  const proficiencyTotals = new Map();
  for (const skill of skills) {
    proficiencyTotals.set(skill.id, { sum: 0, name: skill.name });
  }
  for (const student of students) {
    const have = new Map(student.skills.map((item) => [item.skillId, item.proficiency]));
    for (const skill of skills) {
      const bucket = proficiencyTotals.get(skill.id);
      bucket.sum += Number(have.get(skill.id)) || 0;
    }
  }

  const demandLookup = new Map(
    demandGroups.map((row) => [row.skillId, row._count.opportunityId]),
  );

  const insights = skills
    .map((skill) => {
      const opportunityCount = demandLookup.get(skill.id) || 0;
      if (opportunityCount <= 0) {
        return null;
      }
      const avg =
        totalStudents === 0
          ? 0
          : proficiencyTotals.get(skill.id).sum / totalStudents;
      const demand = demandLevel(opportunityCount, publishedCount);
      const proficiency = proficiencyLevel(avg);
      return {
        ...buildSkillDemandInsight({
          skillName: skill.name,
          demand,
          proficiency,
        }),
        opportunityCount,
        averageStudentProficiency: Math.round(avg * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const gapRank = { Significant: 0, Notable: 1, Watch: 2, Aligned: 3, "Low priority": 4 };
      const gapDiff = (gapRank[a.gap] ?? 9) - (gapRank[b.gap] ?? 9);
      if (gapDiff !== 0) {
        return gapDiff;
      }
      return b.opportunityCount - a.opportunityCount || a.skill.localeCompare(b.skill);
    })
    .slice(0, INSIGHT_LIMIT);

  const pipeline = {
    APPLIED: 0,
    UNDER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const row of pipelineGroups) {
    pipeline[row.status] = row._count._all;
  }

  return {
    scope: "PLATFORM",
    notice:
      "Platform-wide anonymized insights. Institution-specific student tenancy is not modeled yet.",
    hasStudentData: totalStudents > 0,
    summary: {
      totalStudents,
      assessedStudents,
      assessmentCompletionPercent: safePercent(assessedStudents, totalStudents),
      averageIndustryReadiness,
      placementReadyStudents: placementReady,
      activeInternships,
      applications: applicationTotal,
      selectedStudents,
    },
    readinessDistribution: distribution,
    skillGaps,
    industryDemand,
    insights,
    applicationPipeline: pipeline,
  };
}
