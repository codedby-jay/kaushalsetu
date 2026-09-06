import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { serializeProfile } from "../utils/student.js";
import { toPublicUser } from "../utils/user.js";
import { validateProfilePayload } from "../validators/studentProfileValidators.js";

async function findProfileByUserId(userId) {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
}

export async function getStudentProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  const profile = await findProfileByUserId(userId);

  return {
    exists: Boolean(profile),
    user: toPublicUser(user),
    profile: serializeProfile(profile),
  };
}

export async function createStudentProfile(userId, body) {
  const existing = await findProfileByUserId(userId);
  if (existing) {
    throw new AppError("Student profile already exists", 409);
  }

  const data = validateProfilePayload(body, { partial: false });
  const profile = await prisma.studentProfile.create({
    data: {
      userId,
      ...data,
    },
  });

  return serializeProfile(profile);
}

export async function updateStudentProfile(userId, body) {
  const existing = await findProfileByUserId(userId);
  if (!existing) {
    throw new AppError("Student profile not found", 404);
  }

  const data = validateProfilePayload(body, { partial: true });
  const profile = await prisma.studentProfile.update({
    where: { id: existing.id },
    data,
  });

  return serializeProfile(profile);
}

export async function deleteStudentProfile(userId) {
  const existing = await findProfileByUserId(userId);
  if (!existing) {
    throw new AppError("Student profile not found", 404);
  }

  await prisma.studentProfile.delete({
    where: { id: existing.id },
  });
}
