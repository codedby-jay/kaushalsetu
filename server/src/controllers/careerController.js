import {
  getCareerRole,
  getStudentCareerGoal,
  listCareerRoles,
  upsertStudentCareerGoal,
} from "../services/careerRoleService.js";
import { getCareerRoadmap } from "../services/careerRoadmapService.js";

export async function listRoles(req, res, next) {
  try {
    const roles = await listCareerRoles();
    res.status(200).json({ success: true, data: { roles } });
  } catch (error) {
    next(error);
  }
}

export async function getRole(req, res, next) {
  try {
    const role = await getCareerRole(req.params.id);
    res.status(200).json({ success: true, data: { role } });
  } catch (error) {
    next(error);
  }
}

export async function getGoal(req, res, next) {
  try {
    const data = await getStudentCareerGoal(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function putGoal(req, res, next) {
  try {
    const data = await upsertStudentCareerGoal(req.user.userId, req.body?.careerRoleId);
    res.status(200).json({
      success: true,
      message: "Career goal saved",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoadmap(req, res, next) {
  try {
    const data = await getCareerRoadmap(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
