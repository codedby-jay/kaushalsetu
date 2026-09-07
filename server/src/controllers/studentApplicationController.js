import {
  applyToOpportunity,
  getStudentApplication,
  listStudentApplications,
  withdrawStudentApplication,
} from "../services/applicationService.js";

export async function apply(req, res, next) {
  try {
    const application = await applyToOpportunity(req.user.userId, req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMine(req, res, next) {
  try {
    const applications = await listStudentApplications(req.user.userId, req.query);
    res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
}

export async function getMine(req, res, next) {
  try {
    const application = await getStudentApplication(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    next(error);
  }
}

export async function withdrawMine(req, res, next) {
  try {
    const application = await withdrawStudentApplication(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Application withdrawn",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
}
