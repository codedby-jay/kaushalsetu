import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { opportunityInclude, serializeOpportunity } from "../utils/opportunity.js";
import { requireCompanyProfile } from "./companyProfileService.js";
import {
  assertPublishable,
  validateOpportunityPayload,
} from "../validators/opportunityValidators.js";

async function ensureSkillsExist(skills) {
  if (!skills?.length) {
    return;
  }

  const ids = skills.map((item) => item.skillId);
  const found = await prisma.skill.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  if (found.length !== ids.length) {
    throw new AppError("Validation failed", 400, {
      skills: "One or more skills were not found in the catalog",
    });
  }
}

async function getOwnedOpportunity(userId, opportunityId) {
  const company = await requireCompanyProfile(userId);

  if (!opportunityId || typeof opportunityId !== "string") {
    throw new AppError("Opportunity not found", 404);
  }

  const opportunity = await prisma.opportunity.findFirst({
    where: {
      id: opportunityId,
      companyProfileId: company.id,
    },
    include: opportunityInclude,
  });

  if (!opportunity) {
    throw new AppError("Opportunity not found", 404);
  }

  return { company, opportunity };
}

async function replaceSkills(tx, opportunityId, skills) {
  await tx.opportunitySkill.deleteMany({ where: { opportunityId } });
  if (!skills?.length) {
    return;
  }
  await tx.opportunitySkill.createMany({
    data: skills.map((item) => ({
      opportunityId,
      skillId: item.skillId,
      requiredProficiency: item.requiredProficiency,
      isRequired: item.isRequired,
    })),
  });
}

export async function listIndustryOpportunities(userId) {
  const company = await requireCompanyProfile(userId);
  const records = await prisma.opportunity.findMany({
    where: { companyProfileId: company.id },
    include: opportunityInclude,
    orderBy: { createdAt: "desc" },
  });

  return records.map((item) => serializeOpportunity(item));
}

export async function getIndustryOpportunity(userId, opportunityId) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  return serializeOpportunity(opportunity);
}

export async function createIndustryOpportunity(userId, body) {
  const company = await requireCompanyProfile(userId);
  const { data, skills } = validateOpportunityPayload(body, { partial: false });
  await ensureSkillsExist(skills || []);

  const created = await prisma.$transaction(async (tx) => {
    const opportunity = await tx.opportunity.create({
      data: {
        ...data,
        companyProfileId: company.id,
        status: "DRAFT",
        publishedAt: null,
      },
    });

    await replaceSkills(tx, opportunity.id, skills || []);

    return tx.opportunity.findUnique({
      where: { id: opportunity.id },
      include: opportunityInclude,
    });
  });

  return serializeOpportunity(created);
}

export async function updateIndustryOpportunity(userId, opportunityId, body) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  if (opportunity.status === "CLOSED") {
    throw new AppError("Closed opportunities cannot be edited", 400);
  }

  const { data, skills } = validateOpportunityPayload(body, { partial: true });
  if (skills) {
    await ensureSkillsExist(skills);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.opportunity.update({
      where: { id: opportunity.id },
      data,
    });

    if (skills) {
      await replaceSkills(tx, opportunity.id, skills);
    }

    return tx.opportunity.findUnique({
      where: { id: opportunity.id },
      include: opportunityInclude,
    });
  });

  return serializeOpportunity(updated);
}

export async function deleteIndustryOpportunity(userId, opportunityId) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  const applicationCount = await prisma.application.count({
    where: { opportunityId: opportunity.id },
  });
  if (applicationCount > 0) {
    throw new AppError(
      "Opportunities with applications cannot be deleted. Close the listing instead.",
      409,
    );
  }
  await prisma.opportunity.delete({
    where: { id: opportunity.id },
  });
}

export async function publishIndustryOpportunity(userId, opportunityId) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  if (opportunity.status === "CLOSED") {
    throw new AppError("Closed opportunities cannot be published", 400);
  }
  if (opportunity.status === "PUBLISHED") {
    throw new AppError("Opportunity is already published", 409);
  }

  assertPublishable(opportunity, opportunity.skills);

  const updated = await prisma.opportunity.update({
    where: { id: opportunity.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    include: opportunityInclude,
  });

  return serializeOpportunity(updated);
}

export async function unpublishIndustryOpportunity(userId, opportunityId) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  if (opportunity.status !== "PUBLISHED") {
    throw new AppError("Only published opportunities can be unpublished", 400);
  }

  const updated = await prisma.opportunity.update({
    where: { id: opportunity.id },
    data: {
      status: "DRAFT",
      publishedAt: null,
    },
    include: opportunityInclude,
  });

  return serializeOpportunity(updated);
}

export async function closeIndustryOpportunity(userId, opportunityId) {
  const { opportunity } = await getOwnedOpportunity(userId, opportunityId);
  if (opportunity.status !== "PUBLISHED") {
    throw new AppError("Only published opportunities can be closed", 400);
  }

  const updated = await prisma.opportunity.update({
    where: { id: opportunity.id },
    data: {
      status: "CLOSED",
    },
    include: opportunityInclude,
  });

  return serializeOpportunity(updated);
}
