import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

function serializeRoleSkill(item) {
  return {
    skillId: item.skillId,
    skillName: item.skill.name,
    category: item.skill.category,
    requiredProficiency: item.requiredProficiency,
    isRequired: item.isRequired,
    sortOrder: item.sortOrder,
  };
}

function serializeRole(role, { includeSkills = false } = {}) {
  const payload = {
    id: role.id,
    name: role.name,
    description: role.description,
    skillCount: role.skills?.length ?? role._count?.skills ?? 0,
  };
  if (includeSkills) {
    payload.skills = (role.skills || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(serializeRoleSkill);
  }
  return payload;
}

export async function listCareerRoles() {
  const roles = await prisma.careerRole.findMany({
    where: { isActive: true },
    include: { _count: { select: { skills: true } } },
    orderBy: { name: "asc" },
  });
  return roles.map((item) => serializeRole(item));
}

export async function getCareerRole(roleId) {
  if (!roleId || typeof roleId !== "string") {
    throw new AppError("Career role not found", 404);
  }
  const role = await prisma.careerRole.findFirst({
    where: { id: roleId, isActive: true },
    include: {
      skills: { include: { skill: true } },
    },
  });
  if (!role) {
    throw new AppError("Career role not found", 404);
  }
  return serializeRole(role, { includeSkills: true });
}

export async function getStudentCareerGoal(userId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    return { exists: false, reason: "NO_PROFILE", role: null };
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
    return { exists: false, role: null };
  }

  return {
    exists: true,
    role: serializeRole(goal.careerRole, { includeSkills: true }),
  };
}

export async function upsertStudentCareerGoal(userId, careerRoleId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError("Create your student profile before saving a career goal.", 400);
  }

  if (!careerRoleId || typeof careerRoleId !== "string") {
    throw new AppError("Validation failed", 400, {
      careerRoleId: "Select a career role",
    });
  }

  const role = await prisma.careerRole.findFirst({
    where: { id: careerRoleId, isActive: true },
    include: {
      skills: { include: { skill: true } },
    },
  });
  if (!role) {
    throw new AppError("Career role not found", 404);
  }

  const goal = await prisma.studentCareerGoal.upsert({
    where: { studentProfileId: profile.id },
    update: { careerRoleId: role.id },
    create: {
      studentProfileId: profile.id,
      careerRoleId: role.id,
    },
  });

  return {
    exists: true,
    id: goal.id,
    role: serializeRole(role, { includeSkills: true }),
  };
}
