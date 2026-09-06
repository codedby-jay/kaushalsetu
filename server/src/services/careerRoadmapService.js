import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { calculateMatch } from "../utils/matching.js";

const READINESS_LABEL = {
  EXCELLENT: "Excellent readiness",
  GOOD: "Good readiness",
  PARTIAL: "Partial readiness",
  LOW: "Low readiness",
};

function compareRecommendations(a, b) {
  if (b.forSkill.gap !== a.forSkill.gap) {
    return b.forSkill.gap - a.forSkill.gap;
  }
  if (a.forSkill.currentProficiency !== b.forSkill.currentProficiency) {
    return a.forSkill.currentProficiency - b.forSkill.currentProficiency;
  }
  return b.focusPercentage - a.focusPercentage;
}

export function rankRecommendedAssessments(unmetSkills, assessments) {
  const bestByAssessment = new Map();

  for (const assessment of assessments) {
    const total = assessment.questionCount || 0;
    if (!total) {
      continue;
    }
    for (const skill of unmetSkills) {
      const count = assessment.skillCounts[skill.skillId] || 0;
      if (!count) {
        continue;
      }
      const focusPercentage = Math.round((count / total) * 100);
      const candidate = {
        assessmentId: assessment.id,
        title: assessment.title,
        description: assessment.description,
        questionCount: total,
        forSkill: {
          skillId: skill.skillId,
          skillName: skill.skillName,
          currentProficiency: skill.currentProficiency,
          requiredProficiency: skill.requiredProficiency,
          gap: skill.gap,
        },
        focusPercentage,
      };
      const existing = bestByAssessment.get(assessment.id);
      if (!existing || compareRecommendations(candidate, existing) < 0) {
        bestByAssessment.set(assessment.id, candidate);
      }
    }
  }

  return [...bestByAssessment.values()].sort(compareRecommendations);
}

export async function getCareerRoadmap(userId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { skills: true },
  });
  if (!profile) {
    throw new AppError("Create your student profile to view a career roadmap.", 400);
  }

  const goal = await prisma.studentCareerGoal.findUnique({
    where: { studentProfileId: profile.id },
    include: {
      careerRole: {
        include: {
          skills: { include: { skill: true } },
        },
      },
    },
  });

  if (!goal || !goal.careerRole.isActive) {
    return {
      exists: false,
      role: null,
      readiness: null,
      skills: [],
      recommendedAssessments: [],
      message: "Select a career goal to see your skill roadmap.",
    };
  }

  const roleSkills = goal.careerRole.skills
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const match = calculateMatch(
    profile.skills,
    roleSkills.map((item) => ({
      skillId: item.skillId,
      name: item.skill.name,
      requiredProficiency: item.requiredProficiency,
      isRequired: item.isRequired,
    })),
  );

  const skills = match.skills.map((item) => ({
    skillId: item.skillId,
    skillName: item.skill,
    currentProficiency: item.currentProficiency,
    requiredProficiency: item.requiredProficiency,
    gap: item.gap,
    isRequired: item.isRequired,
    status: item.status,
  }));

  const unmet = skills.filter(
    (item) => item.currentProficiency < item.requiredProficiency,
  );

  const assessments = await prisma.assessment.findMany({
    where: { isActive: true },
    include: {
      questions: {
        select: { skillId: true },
      },
    },
  });

  const coverage = assessments.map((item) => {
    const skillCounts = {};
    for (const question of item.questions) {
      skillCounts[question.skillId] = (skillCounts[question.skillId] || 0) + 1;
    }
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      questionCount: item.questions.length,
      skillCounts,
    };
  });

  const recommendedAssessments = rankRecommendedAssessments(unmet, coverage);
  const meetsTargets = unmet.length === 0;

  return {
    exists: true,
    role: {
      id: goal.careerRole.id,
      name: goal.careerRole.name,
      description: goal.careerRole.description,
    },
    readiness: {
      percentage: match.matchPercentage,
      band: match.band,
      label: READINESS_LABEL[match.band] || match.label,
    },
    skills,
    recommendedAssessments,
    summary: match.summary,
    message: meetsTargets
      ? "You currently meet this role's target skill levels. Opportunity matching will use your updated proficiency."
      : match.recommendation,
  };
}
