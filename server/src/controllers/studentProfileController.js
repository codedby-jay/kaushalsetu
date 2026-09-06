import {
  createStudentProfile,
  deleteStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from "../services/studentProfileService.js";

export async function getProfile(req, res, next) {
  try {
    const data = await getStudentProfile(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createProfile(req, res, next) {
  try {
    const profile = await createStudentProfile(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Profile created",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await updateStudentProfile(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProfile(req, res, next) {
  try {
    await deleteStudentProfile(req.user.userId);
    res.status(200).json({
      success: true,
      message: "Profile deleted",
    });
  } catch (error) {
    next(error);
  }
}
