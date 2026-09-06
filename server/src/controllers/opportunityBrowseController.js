import { getOpportunityMatch } from "../services/matchingService.js";
import {
  getPublishedOpportunity,
  listPublishedOpportunities,
} from "../services/opportunityBrowseService.js";

export async function listPublished(req, res, next) {
  try {
    const opportunities = await listPublishedOpportunities(req.query, req.user.userId);
    res.status(200).json({ success: true, data: { opportunities } });
  } catch (error) {
    next(error);
  }
}

export async function getMatch(req, res, next) {
  try {
    const match = await getOpportunityMatch(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: { match } });
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
