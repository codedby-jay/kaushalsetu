import {
  closeIndustryOpportunity,
  createIndustryOpportunity,
  deleteIndustryOpportunity,
  getIndustryOpportunity,
  listIndustryOpportunities,
  publishIndustryOpportunity,
  unpublishIndustryOpportunity,
  updateIndustryOpportunity,
} from "../services/industryOpportunityService.js";

export async function listMine(req, res, next) {
  try {
    const opportunities = await listIndustryOpportunities(req.user.userId);
    res.status(200).json({ success: true, data: { opportunities } });
  } catch (error) {
    next(error);
  }
}

export async function getMine(req, res, next) {
  try {
    const opportunity = await getIndustryOpportunity(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: { opportunity } });
  } catch (error) {
    next(error);
  }
}

export async function createMine(req, res, next) {
  try {
    const opportunity = await createIndustryOpportunity(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Opportunity saved as draft",
      data: { opportunity },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMine(req, res, next) {
  try {
    const opportunity = await updateIndustryOpportunity(
      req.user.userId,
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Opportunity updated",
      data: { opportunity },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMine(req, res, next) {
  try {
    await deleteIndustryOpportunity(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Opportunity deleted",
    });
  } catch (error) {
    next(error);
  }
}

export async function publishMine(req, res, next) {
  try {
    const opportunity = await publishIndustryOpportunity(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Opportunity published",
      data: { opportunity },
    });
  } catch (error) {
    next(error);
  }
}

export async function unpublishMine(req, res, next) {
  try {
    const opportunity = await unpublishIndustryOpportunity(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Opportunity unpublished",
      data: { opportunity },
    });
  } catch (error) {
    next(error);
  }
}

export async function closeMine(req, res, next) {
  try {
    const opportunity = await closeIndustryOpportunity(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Opportunity closed",
      data: { opportunity },
    });
  } catch (error) {
    next(error);
  }
}
