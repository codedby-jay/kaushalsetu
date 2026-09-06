import {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
} from "../services/companyProfileService.js";

export async function getProfile(req, res, next) {
  try {
    const data = await getCompanyProfile(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createProfile(req, res, next) {
  try {
    const profile = await createCompanyProfile(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Company profile created",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await updateCompanyProfile(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      message: "Company profile updated",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}
