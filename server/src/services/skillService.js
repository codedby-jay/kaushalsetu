import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  serializeStudentSkill,
  summarizeSkills,
} from "../utils/student.js";
import {
  validateAddStudentSkill,
  validateSkillId,
  validateUpdateStudentSkill,
} from "../validators/skillValidators.js";

async function requireStudentProfile(userId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Create your student profile before adding skills", 404);
  }

  return profile;
}

export async function listSkillCatalog() {
  return prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
    },
  });
}

export async function getStudentSkills(userId) {
  const profile = await requireStudentProfile(userId);
  const records = await prisma.studentSkill.findMany({
    where: { studentProfileId: profile.id },
    include: { skill: true },
    orderBy: { createdAt: "asc" },
  });

  const skills = records.map(serializeStudentSkill);
  return {
    skills,
    grouped: {
      TECHNICAL: skills.filter((item) => item.category === "TECHNICAL"),
      SOFT: skills.filter((item) => item.category === "SOFT"),
    },
    summary: summarizeSkills(records),
  };
}

export async function addStudentSkill(userId, body) {
  const profile = await requireStudentProfile(userId);
  const input = validateAddStudentSkill(body);

  const skill = await prisma.skill.findUnique({
    where: { id: input.skillId },
  });
  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  try {
    const record = await prisma.studentSkill.create({
      data: {
        studentProfileId: profile.id,
        skillId: input.skillId,
        proficiency: input.proficiency,
      },
      include: { skill: true },
    });
    return serializeStudentSkill(record);
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("This skill is already on your profile", 409);
    }
    throw error;
  }
}

export async function updateStudentSkill(userId, skillId, body) {
  const profile = await requireStudentProfile(userId);
  const validSkillId = validateSkillId(skillId);
  const input = validateUpdateStudentSkill(body);

  const existing = await prisma.studentSkill.findUnique({
    where: {
      studentProfileId_skillId: {
        studentProfileId: profile.id,
        skillId: validSkillId,
      },
    },
  });

  if (!existing) {
    throw new AppError("Skill not found on your profile", 404);
  }

  const record = await prisma.studentSkill.update({
    where: { id: existing.id },
    data: { proficiency: input.proficiency },
    include: { skill: true },
  });

  return serializeStudentSkill(record);
}

export async function removeStudentSkill(userId, skillId) {
  const profile = await requireStudentProfile(userId);
  const validSkillId = validateSkillId(skillId);

  const existing = await prisma.studentSkill.findUnique({
    where: {
      studentProfileId_skillId: {
        studentProfileId: profile.id,
        skillId: validSkillId,
      },
    },
  });

  if (!existing) {
    throw new AppError("Skill not found on your profile", 404);
  }

  await prisma.studentSkill.delete({
    where: { id: existing.id },
  });
}
