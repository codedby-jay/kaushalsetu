import {
  getAcademicianDashboard,
  getIndustryDashboard,
  getInstitutionDashboard,
  getStudentDashboard,
} from "../services/dashboardService.js";

export async function studentDashboard(req, res, next) {
  try {
    const dashboard = await getStudentDashboard(req.user.userId);
    res.status(200).json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
}

export async function industryDashboard(req, res, next) {
  try {
    const dashboard = await getIndustryDashboard(req.user.userId);
    res.status(200).json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
}

export async function institutionDashboard(req, res, next) {
  try {
    const dashboard = await getInstitutionDashboard();
    res.status(200).json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
}

export async function academicianDashboard(req, res, next) {
  try {
    const dashboard = await getAcademicianDashboard(req.user.userId);
    res.status(200).json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
}
