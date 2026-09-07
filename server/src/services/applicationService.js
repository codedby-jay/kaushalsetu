import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  allowedIndustryTransitions,
  applicationInclude,
  canStudentWithdraw,
  compactApplication,
  isValidIndustryTransition,
  myApplicationSummary,
  serializeApplication,
} from "../utils/application.js";
import { calculateMatch, compactMatch } from "../utils/matching.js";
import { serializeOpportunitySkill } from "../utils/opportunity.js";
import { buildRankingMetadata, rankCandidates } from "../utils/ranking.js";
import { requireCompanyProfile } from "./companyProfileService.js";
import {
  parseApplicationFilters,
  parseIndustryCandidateFilters,
  validateApplyPayload,
} from "../validators/applicationValidators.js";

async function requireStudentProfile(userId, message = "Create your student profile first") {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { skills: true },
  });
  if (!profile) {
    throw new AppError(message, 400);
  }
  return profile;
}

function opportunitySkillsForMatch(opportunity) {
  return (opportunity?.skills || []).map((item) =>
    item.name ? item : serializeOpportunitySkill(item),
  );
}

function attachMatch(studentSkills, opportunity, compact = true) {
  const result = calculateMatch(studentSkills, opportunitySkillsForMatch(opportunity));
  return compact ? compactMatch(result) : result;
}

export async function attachMyApplications(userId, opportunities) {
  if (!opportunities.length) {
    return opportunities.map((item) => ({ ...item, myApplication: null }));
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return opportunities.map((item) => ({ ...item, myApplication: null }));
  }

  const records = await prisma.application.findMany({
    where: {
      studentProfileId: profile.id,
      opportunityId: { in: opportunities.map((item) => item.id) },
    },
    select: { id: true, status: true, appliedAt: true, opportunityId: true },
  });

  const byOpportunity = new Map(
    records.map((item) => [item.opportunityId, myApplicationSummary(item)]),
  );

  return opportunities.map((item) => ({
    ...item,
    myApplication: byOpportunity.get(item.id) || null,
  }));
}

export async function applyToOpportunity(userId, opportunityId, body) {
  if (!opportunityId || typeof opportunityId !== "string") {
    throw new AppError("Opportunity not found", 404);
  }

  const data = validateApplyPayload(body);
  const profile = await requireStudentProfile(
    userId,
    "Create your student profile before applying",
  );

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: opportunityId },
    include: {
      company: true,
      skills: { include: { skill: true } },
    },
  });

  if (!opportunity || opportunity.status === "DRAFT") {
    throw new AppError("Opportunity not found", 404);
  }
  if (opportunity.status === "CLOSED") {
    throw new AppError("This opportunity is closed and is not accepting applications", 409);
  }
  if (opportunity.applicationDeadline && new Date(opportunity.applicationDeadline) < new Date()) {
    throw new AppError("The application deadline has passed", 409);
  }

  try {
    const created = await prisma.application.create({
      data: {
        studentProfileId: profile.id,
        opportunityId: opportunity.id,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
      },
      include: applicationInclude,
    });

    return serializeApplication(created, {
      match: attachMatch(profile.skills, created.opportunity, false),
      viewer: "student",
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("You have already applied to this opportunity", 409);
    }
    throw error;
  }
}

export async function listStudentApplications(userId, query) {
  const profile = await requireStudentProfile(userId);
  const filters = parseApplicationFilters(query);
  const where = { studentProfileId: profile.id };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.search) {
    where.opportunity = {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { company: { companyName: { contains: filters.search, mode: "insensitive" } } },
      ],
    };
  }

  const records = await prisma.application.findMany({
    where,
    include: applicationInclude,
    orderBy: { appliedAt: "desc" },
  });

  return records.map((record) =>
    compactApplication(record, {
      match: calculateMatch(profile.skills, opportunitySkillsForMatch(record.opportunity)),
    }),
  );
}

export async function getStudentApplication(userId, applicationId) {
  const profile = await requireStudentProfile(userId);
  if (!applicationId || typeof applicationId !== "string") {
    throw new AppError("Application not found", 404);
  }

  const record = await prisma.application.findFirst({
    where: {
      id: applicationId,
      studentProfileId: profile.id,
    },
    include: applicationInclude,
  });

  if (!record) {
    throw new AppError("Application not found", 404);
  }

  return serializeApplication(record, {
    match: attachMatch(profile.skills, record.opportunity, false),
    viewer: "student",
  });
}

export async function withdrawStudentApplication(userId, applicationId) {
  const profile = await requireStudentProfile(userId);
  if (!applicationId || typeof applicationId !== "string") {
    throw new AppError("Application not found", 404);
  }

  const record = await prisma.application.findFirst({
    where: {
      id: applicationId,
      studentProfileId: profile.id,
    },
    include: applicationInclude,
  });

  if (!record) {
    throw new AppError("Application not found", 404);
  }
  if (!canStudentWithdraw(record.status)) {
    throw new AppError("This application can no longer be withdrawn", 409);
  }

  const updated = await prisma.application.update({
    where: { id: record.id },
    data: { status: "WITHDRAWN" },
    include: applicationInclude,
  });

  return serializeApplication(updated, {
    match: attachMatch(profile.skills, updated.opportunity, false),
    viewer: "student",
  });
}

async function getOwnedApplication(userId, applicationId) {
  const company = await requireCompanyProfile(userId);
  if (!applicationId || typeof applicationId !== "string") {
    throw new AppError("Application not found", 404);
  }

  const record = await prisma.application.findFirst({
    where: {
      id: applicationId,
      opportunity: { companyProfileId: company.id },
    },
    include: applicationInclude,
  });

  if (!record) {
    throw new AppError("Application not found", 404);
  }

  return { company, record };
}

export async function listIndustryOpportunityApplications(userId, opportunityId, query) {
  const company = await requireCompanyProfile(userId);
  if (!opportunityId || typeof opportunityId !== "string") {
    throw new AppError("Opportunity not found", 404);
  }

  const opportunity = await prisma.opportunity.findFirst({
    where: {
      id: opportunityId,
      companyProfileId: company.id,
    },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!opportunity) {
    throw new AppError("Opportunity not found", 404);
  }

  const filters = parseIndustryCandidateFilters(query);
  const where = { opportunityId: opportunity.id };
  if (filters.status) {
    where.status = filters.status;
  } else if (!filters.includeWithdrawn) {
    where.status = { not: "WITHDRAWN" };
  }
  if (filters.search) {
    where.profile = {
      OR: [
        { user: { name: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
        { headline: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const records = await prisma.application.findMany({
    where,
    include: applicationInclude,
    orderBy: { appliedAt: "desc" },
  });

  const requirements = opportunitySkillsForMatch(opportunity);
  const scored = [];

  for (const record of records) {
    const match = calculateMatch(record.profile?.skills || [], requirements);
    if (filters.minMatch !== undefined && match.matchPercentage < filters.minMatch) {
      continue;
    }
    const ranking = buildRankingMetadata(match);
    scored.push({
      id: record.id,
      record,
      match,
      matchPercentage: match.matchPercentage,
      requiredSkillCoverage: ranking.requiredSkillCoverage,
      totalSkillGap: ranking.totalSkillGap,
      appliedAt: record.appliedAt,
      ranking,
    });
  }

  const ranked = rankCandidates(scored, filters.sort);

  return {
    applications: ranked.map((item) =>
      serializeApplication(item.record, {
        match: compactMatch(item.match),
        viewer: "industry",
        ranking: {
          rank: item.rank,
          requiredSkillCoverage: item.ranking.requiredSkillCoverage,
          coveredRequiredCount: item.ranking.coveredRequiredCount,
          requiredCount: item.ranking.requiredCount,
          totalSkillGap: item.ranking.totalSkillGap,
        },
      }),
    ),
    meta: {
      sort: filters.sort,
      minMatch: filters.minMatch ?? null,
      includeWithdrawn: Boolean(filters.status) || filters.includeWithdrawn,
    },
  };
}

export async function getIndustryApplication(userId, applicationId) {
  const { record } = await getOwnedApplication(userId, applicationId);
  const match = attachMatch(record.profile?.skills || [], record.opportunity, false);
  return serializeApplication(record, {
    match,
    viewer: "industry",
    ranking: buildRankingMetadata(match),
  });
}

export async function updateIndustryApplicationStatus(userId, applicationId, nextStatus) {
  const { record } = await getOwnedApplication(userId, applicationId);

  if (!isValidIndustryTransition(record.status, nextStatus)) {
    const allowed = allowedIndustryTransitions(record.status);
    throw new AppError(
      allowed.length
        ? `Status can only move from ${record.status} to ${allowed.join(" or ")}`
        : `${record.status} applications cannot be updated`,
      400,
      { status: "Invalid application status transition" },
    );
  }

  const updated = await prisma.application.update({
    where: { id: record.id },
    data: { status: nextStatus },
    include: applicationInclude,
  });

  const match = attachMatch(updated.profile?.skills || [], updated.opportunity, false);
  return serializeApplication(updated, {
    match,
    viewer: "industry",
    ranking: buildRankingMetadata(match),
  });
}
