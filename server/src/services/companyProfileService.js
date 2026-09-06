import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { serializeCompanyProfile } from "../utils/opportunity.js";
import { toPublicUser } from "../utils/user.js";
import { validateCompanyProfilePayload } from "../validators/companyProfileValidators.js";

async function findCompanyByUserId(userId) {
  return prisma.companyProfile.findUnique({
    where: { userId },
  });
}

export async function getCompanyProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  const profile = await findCompanyByUserId(userId);

  return {
    exists: Boolean(profile),
    user: toPublicUser(user),
    profile: serializeCompanyProfile(profile),
  };
}

export async function createCompanyProfile(userId, body) {
  const existing = await findCompanyByUserId(userId);
  if (existing) {
    throw new AppError("Company profile already exists", 409);
  }

  const data = validateCompanyProfilePayload(body, { partial: false });
  const profile = await prisma.companyProfile.create({
    data: {
      userId,
      ...data,
    },
  });

  return serializeCompanyProfile(profile);
}

export async function updateCompanyProfile(userId, body) {
  const existing = await findCompanyByUserId(userId);
  if (!existing) {
    throw new AppError("Company profile not found", 404);
  }

  const data = validateCompanyProfilePayload(body, { partial: true });
  const profile = await prisma.companyProfile.update({
    where: { id: existing.id },
    data,
  });

  return serializeCompanyProfile(profile);
}

export async function requireCompanyProfile(userId) {
  const profile = await findCompanyByUserId(userId);
  if (!profile) {
    throw new AppError("Create a company profile first", 400);
  }
  return profile;
}
