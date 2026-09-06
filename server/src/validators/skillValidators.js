import { AppError } from "../utils/AppError.js";

export function validateSkillId(skillId) {
  if (!skillId || typeof skillId !== "string" || skillId.length < 8) {
    throw new AppError("A valid skill is required", 400, { skillId: "Invalid skill" });
  }
  return String(skillId);
}

export function validateProficiency(value) {
  const proficiency = Number(value);
  if (!Number.isInteger(proficiency) || proficiency < 0 || proficiency > 10) {
    throw new AppError("Validation failed", 400, {
      proficiency: "Proficiency must be an integer from 0 to 10",
    });
  }
  return proficiency;
}

export function validateAddStudentSkill(body) {
  return {
    skillId: validateSkillId(body?.skillId),
    proficiency: validateProficiency(body?.proficiency),
  };
}

export function validateUpdateStudentSkill(body) {
  return {
    proficiency: validateProficiency(body?.proficiency),
  };
}
