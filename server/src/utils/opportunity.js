export function serializeCompanyProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    companyName: profile.companyName,
    description: profile.description,
    industry: profile.industry,
    website: profile.website,
    location: profile.location,
    companySize: profile.companySize,
    logoUrl: profile.logoUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function serializeOpportunitySkill(record) {
  return {
    id: record.id,
    skillId: record.skillId,
    name: record.skill.name,
    category: record.skill.category,
    requiredProficiency: record.requiredProficiency,
    isRequired: record.isRequired,
  };
}

export function serializeCompanyPublic(company) {
  if (!company) {
    return null;
  }

  return {
    id: company.id,
    companyName: company.companyName,
    description: company.description,
    industry: company.industry,
    website: company.website,
    location: company.location,
    companySize: company.companySize,
    logoUrl: company.logoUrl,
  };
}

export function serializeOpportunity(record, { includeStatus = true } = {}) {
  const skills = (record.skills || []).map(serializeOpportunitySkill);
  const payload = {
    id: record.id,
    title: record.title,
    description: record.description,
    type: record.type,
    location: record.location,
    workMode: record.workMode,
    duration: record.duration,
    stipend: record.stipend,
    salaryMin: record.salaryMin,
    salaryMax: record.salaryMax,
    applicationDeadline: record.applicationDeadline,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    company: serializeCompanyPublic(record.company),
    skills,
  };

  if (includeStatus) {
    payload.status = record.status;
    payload.publishedAt = record.publishedAt;
    payload.applicationCount = record._count?.applications ?? 0;
  }

  return payload;
}

export const opportunityInclude = {
  company: true,
  skills: {
    include: { skill: true },
    orderBy: { createdAt: "asc" },
  },
  _count: {
    select: { applications: true },
  },
};
