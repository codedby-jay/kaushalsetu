import {
  addStudentSkill,
  getStudentSkills,
  listSkillCatalog,
  removeStudentSkill,
  updateStudentSkill,
} from "../services/skillService.js";

export async function listCatalog(req, res, next) {
  try {
    const skills = await listSkillCatalog();
    res.status(200).json({ success: true, data: { skills } });
  } catch (error) {
    next(error);
  }
}

export async function listMine(req, res, next) {
  try {
    const data = await getStudentSkills(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function addMine(req, res, next) {
  try {
    const skill = await addStudentSkill(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Skill added",
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMine(req, res, next) {
  try {
    const skill = await updateStudentSkill(
      req.user.userId,
      req.params.skillId,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Skill updated",
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMine(req, res, next) {
  try {
    await removeStudentSkill(req.user.userId, req.params.skillId);
    res.status(200).json({
      success: true,
      message: "Skill removed",
    });
  } catch (error) {
    next(error);
  }
}
