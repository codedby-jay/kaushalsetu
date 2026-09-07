import {
  getIndustryApplication,
  listIndustryOpportunityApplications,
  updateIndustryApplicationStatus,
} from "../services/applicationService.js";
import { validateStatusPayload } from "../validators/applicationValidators.js";

export async function listForOpportunity(req, res, next) {
  try {
    const applications = await listIndustryOpportunityApplications(
      req.user.userId,
      req.params.id,
      req.query,
    );
    res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
}

export async function getOwned(req, res, next) {
  try {
    const application = await getIndustryApplication(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const status = validateStatusPayload(req.body);
    const application = await updateIndustryApplicationStatus(
      req.user.userId,
      req.params.id,
      status,
    );
    res.status(200).json({
      success: true,
      message: "Application status updated",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
}
