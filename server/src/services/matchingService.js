import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { calculateMatch, compactMatch } from "../utils/matching.js";
import { opportunityInclude, serializeOpportunity } from "../utils/opportunity.js";

async function loadStudentSkillState(userId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true,
    },
  });

  if (!profile) {
    return { exists: false, skills: [] };
  }

  return {
    exists: true,
    skills: profile.skills,
  };
}

export async function attachOpportunityMatches(userId, opportunities) {
  const state = await loadStudentSkillState(userId);

  if (!state.exists) {
    return opportunities.map((item) => ({
      ...item,
      match: { available: false, reason: "NO_PROFILE" },
    }));
  }

  if (state.skills.length === 0) {
    return opportunities.map((item) => ({
      ...item,
      match: { available: false, reason: "NO_SKILLS" },
    }));
  }

  return opportunities.map((item) => ({
    ...item,
    match: compactMatch(calculateMatch(state.skills, item.skills || [])),
  }));
}

export async function getOpportunityMatch(userId, opportunityId) {
  if (!opportunityId || typeof opportunityId !== "string") {
    throw new AppError("Opportunity not found", 404);
  }

  const state = await loadStudentSkillState(userId);
  if (!state.exists) {
    throw new AppError("Create your profile to see your opportunity match.", 400);
  }

  const record = await prisma.opportunity.findFirst({
    where: {
      id: opportunityId,
      status: "PUBLISHED",
    },
    include: opportunityInclude,
  });

  if (!record) {
    throw new AppError("Opportunity not found", 404);
  }

  const serialized = serializeOpportunity(record, { includeStatus: false });
  const match = calculateMatch(state.skills, serialized.skills);

  return {
    opportunityId: serialized.id,
    hasStudentSkills: state.skills.length > 0,
    ...match,
  };
}
