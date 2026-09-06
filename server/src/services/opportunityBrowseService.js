import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { opportunityInclude, serializeOpportunity } from "../utils/opportunity.js";
import { parseBrowseFilters } from "../validators/opportunityValidators.js";

function buildWhere(filters) {
  const where = {
    status: "PUBLISHED",
  };

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.workMode) {
    where.workMode = filters.workMode;
  }
  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: "insensitive",
    };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
      { company: { companyName: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function listPublishedOpportunities(query) {
  const filters = parseBrowseFilters(query);
  const records = await prisma.opportunity.findMany({
    where: buildWhere(filters),
    include: opportunityInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return records.map((item) => serializeOpportunity(item, { includeStatus: false }));
}

export async function getPublishedOpportunity(opportunityId) {
  if (!opportunityId || typeof opportunityId !== "string") {
    throw new AppError("Opportunity not found", 404);
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

  return serializeOpportunity(record, { includeStatus: false });
}
