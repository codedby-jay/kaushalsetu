import { prisma } from "../config/prisma.js";
import { calculateMatch, compactMatch } from "../utils/matching.js";
import { serializeOpportunity, serializeOpportunitySkill } from "../utils/opportunity.js";
import { compactApplication } from "../utils/application.js";
import { buildRankingMetadata, rankCandidates } from "../utils/ranking.js";
import { readinessFromCareerMatch } from "../utils/readiness.js";
import { getCareerRoadmap } from "./careerRoadmapService.js";
import { getSkillIntelligence } from "./assessmentService.js";
import { getInstitutionAnalytics } from "./institutionAnalyticsService.js";
import { toPublicUser } from "../utils/user.js";

const PUBLISHED_MATCH_CAP = 50;
const RECOMMENDED_OPPORTUNITY_LIMIT = 5;
const RECENT_APPLICATION_LIMIT = 5;
const INDUSTRY_RECENT_LIMIT = 8;
const INDUSTRY_TOP_CANDIDATES = 5;
const INDUSTRY_RANK_CAP = 50;
const ACADEMICIAN_ACTIVITY_LIMIT = 5;

const PROFILE_FIELDS = [
  "headline",
  "bio",
  "phone",
  "location",
  "college",
  "degree",
  "graduationYear",
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
];

function profileCompletion(profile, skillCount = 0) {
  const total = PROFILE_FIELDS.length + 1;
  let completed = 0;
  if (profile) {
    for (const field of PROFILE_FIELDS) {
      const value = profile[field];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        completed += 1;
      }
    }
  }
  if (skillCount > 0) {
    completed += 1;
  }
  return Math.round((completed / total) * 100);
}

function emptyStudentDashboard(user) {
  return {
    user: toPublicUser(user),
    hasProfile: false,
    metrics: {
      industryReadiness: readinessFromCareerMatch(false, null),
      skillsAdded: 0,
      applications: 0,
      recommendedOpportunities: 0,
    },
    career: {
      exists: false,
      role: null,
      readiness: null,
      skills: [],
      recommendedAssessment: null,
      message: "Set a career goal to see your readiness roadmap.",
    },
    skillIntelligence: { exists: false },
    recommendedOpportunities: [],
    recentApplications: [],
    profileCompletion: {
      percent: 0,
      complete: false,
      prompt: "Complete your profile to improve opportunity matching.",
    },
  };
}

function opportunitySkillsForMatch(opportunity) {
  return (opportunity?.skills || []).map((item) =>
    item.name ? item : serializeOpportunitySkill(item),
  );
}

export async function getStudentDashboard(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { skills: true },
  });

  if (!profile) {
    return emptyStudentDashboard(user);
  }

  const [roadmap, intelligence, applicationCount, recentRecords, published] =
    await Promise.all([
      getCareerRoadmap(userId),
      getSkillIntelligence(userId),
      prisma.application.count({
        where: {
          studentProfileId: profile.id,
          status: { not: "WITHDRAWN" },
        },
      }),
      prisma.application.findMany({
        where: { studentProfileId: profile.id },
        include: {
          opportunity: {
            include: {
              company: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: RECENT_APPLICATION_LIMIT,
      }),
      prisma.opportunity.findMany({
        where: { status: "PUBLISHED" },
        include: {
          company: true,
          skills: { include: { skill: true }, orderBy: { createdAt: "asc" } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: PUBLISHED_MATCH_CAP,
      }),
    ]);

  const hasGoal = Boolean(roadmap.exists);
  const industryReadiness = readinessFromCareerMatch(
    hasGoal,
    roadmap.readiness?.percentage,
  );

  const matched = [];
  if (profile.skills.length > 0) {
    for (const record of published) {
      const serialized = serializeOpportunity(record, { includeStatus: false });
      const match = compactMatch(calculateMatch(profile.skills, serialized.skills));
      matched.push({
        id: serialized.id,
        title: serialized.title,
        companyName: serialized.company?.companyName || "",
        match,
      });
    }
    matched.sort(
      (a, b) =>
        b.match.matchPercentage - a.match.matchPercentage ||
        a.title.localeCompare(b.title),
    );
  }

  const recommendedOpportunities = matched.slice(0, RECOMMENDED_OPPORTUNITY_LIMIT);
  const recommendedCount = matched.filter(
    (item) => item.match.matchPercentage >= 60,
  ).length;

  const recentApplications = recentRecords.map((record) =>
    compactApplication(record, {
      match: calculateMatch(profile.skills, opportunitySkillsForMatch(record.opportunity)),
    }),
  );

  const completion = profileCompletion(profile, profile.skills.length);
  const recommendedAssessment = roadmap.recommendedAssessments?.[0] || null;

  return {
    user: toPublicUser(user),
    hasProfile: true,
    metrics: {
      industryReadiness,
      skillsAdded: profile.skills.length,
      applications: applicationCount,
      recommendedOpportunities: recommendedCount,
    },
    career: {
      exists: roadmap.exists,
      role: roadmap.role,
      readiness: roadmap.readiness,
      skills: (roadmap.skills || []).slice(0, 8),
      recommendedAssessment,
      message: roadmap.message,
    },
    skillIntelligence: intelligence.exists
      ? {
          exists: true,
          strengths: intelligence.strengths,
          developing: intelligence.developing,
          skillGaps: intelligence.skillGaps,
        }
      : { exists: false },
    recommendedOpportunities,
    recentApplications,
    profileCompletion: {
      percent: completion,
      complete: completion >= 100,
      prompt:
        completion >= 100
          ? null
          : "Complete your profile to improve opportunity matching.",
    },
  };
}

export async function getIndustryDashboard(userId) {
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!company) {
    return {
      exists: false,
      company: null,
      metrics: {
        openOpportunities: 0,
        applications: 0,
        shortlisted: 0,
        selected: 0,
      },
      pipeline: {
        APPLIED: 0,
        UNDER_REVIEW: 0,
        SHORTLISTED: 0,
        INTERVIEW: 0,
        SELECTED: 0,
        REJECTED: 0,
      },
      opportunities: [],
      recentApplications: [],
      topCandidates: [],
    };
  }

  const owned = { opportunity: { companyProfileId: company.id } };

  const [openOpportunities, pipelineGroups, opportunities, recentRecords, rankRecords] =
    await Promise.all([
      prisma.opportunity.count({
        where: { companyProfileId: company.id, status: "PUBLISHED" },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: owned,
        _count: { _all: true },
      }),
      prisma.opportunity.findMany({
        where: { companyProfileId: company.id },
        include: {
          company: true,
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: owned,
        include: {
          profile: { include: { user: true, skills: true } },
          opportunity: {
            include: { company: true, skills: { include: { skill: true } } },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: INDUSTRY_RECENT_LIMIT,
      }),
      prisma.application.findMany({
        where: {
          ...owned,
          status: { not: "WITHDRAWN" },
        },
        include: {
          profile: { include: { user: true, skills: true } },
          opportunity: {
            include: { company: true, skills: { include: { skill: true } } },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: INDUSTRY_RANK_CAP,
      }),
    ]);

  const pipeline = {
    APPLIED: 0,
    UNDER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };
  let applications = 0;
  for (const row of pipelineGroups) {
    if (row.status !== "WITHDRAWN") {
      applications += row._count._all;
    }
    if (pipeline[row.status] !== undefined) {
      pipeline[row.status] = row._count._all;
    }
  }

  function compactIndustryApplication(record) {
    const match = calculateMatch(
      record.profile?.skills || [],
      opportunitySkillsForMatch(record.opportunity),
    );
    const ranking = buildRankingMetadata(match);
    return {
      id: record.id,
      status: record.status,
      appliedAt: record.appliedAt,
      candidateName: record.profile?.user?.name || "",
      opportunityId: record.opportunityId,
      opportunityTitle: record.opportunity?.title || "",
      matchPercentage: match.matchPercentage,
      band: match.band,
      label: match.label,
      requiredSkillCoverage: ranking.requiredSkillCoverage,
      totalSkillGap: ranking.totalSkillGap,
    };
  }

  const recentApplications = recentRecords.map(compactIndustryApplication);

  const scored = rankRecords.map((record) => {
    const row = compactIndustryApplication(record);
    return {
      ...row,
      matchPercentage: row.matchPercentage,
      requiredSkillCoverage: row.requiredSkillCoverage,
      totalSkillGap: row.totalSkillGap,
      appliedAt: record.appliedAt,
    };
  });
  const topCandidates = rankCandidates(scored, "match_desc")
    .slice(0, INDUSTRY_TOP_CANDIDATES)
    .map((item) => ({
      id: item.id,
      rank: item.rank,
      candidateName: item.candidateName,
      opportunityId: item.opportunityId,
      opportunityTitle: item.opportunityTitle,
      status: item.status,
      appliedAt: item.appliedAt,
      matchPercentage: item.matchPercentage,
      band: item.band,
      label: item.label,
      requiredSkillCoverage: item.requiredSkillCoverage,
      totalSkillGap: item.totalSkillGap,
    }));

  return {
    exists: true,
    company: {
      companyName: company.companyName,
    },
    metrics: {
      openOpportunities,
      applications,
      shortlisted: pipeline.SHORTLISTED,
      selected: pipeline.SELECTED,
    },
    pipeline,
    opportunities: opportunities.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      applicationCount: item._count?.applications ?? 0,
    })),
    recentApplications,
    topCandidates,
  };
}

export async function getAcademicianDashboard(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const activity = await prisma.opportunity.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: ACADEMICIAN_ACTIVITY_LIMIT,
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      company: { select: { companyName: true } },
    },
  });

  return {
    user: toPublicUser(user),
    collaborationPhase: "upcoming",
    message:
      "Faculty internships, FDPs, consultancy, and research collaboration arrive in a later phase.",
    industryActivity: activity.map((item) => ({
      title: item.title,
      companyName: item.company?.companyName || "",
      type: item.type,
      location: item.location,
    })),
  };
}

export async function getInstitutionDashboard() {
  return getInstitutionAnalytics();
}
