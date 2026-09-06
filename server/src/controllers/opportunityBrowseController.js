import {
  getPublishedOpportunity,
  listPublishedOpportunities,
} from "../services/opportunityBrowseService.js";

export async function listPublished(req, res, next) {
  try {
    const opportunities = await listPublishedOpportunities(req.query);
    res.status(200).json({ success: true, data: { opportunities } });
  } catch (error) {
    next(error);
  }
}

export async function getPublished(req, res, next) {
  try {
    const opportunity = await getPublishedOpportunity(req.params.id);
    res.status(200).json({ success: true, data: { opportunity } });
  } catch (error) {
    next(error);
  }
}
