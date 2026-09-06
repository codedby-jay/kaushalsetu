import { Router } from "express";
import {
  closeMine,
  createMine,
  getMine,
  listMine,
  publishMine,
  removeMine,
  unpublishMine,
  updateMine,
} from "../controllers/industryOpportunityController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const industryOpportunityRoutes = Router();
const industryOnly = [authenticate, authorizeRoles("INDUSTRY")];

industryOpportunityRoutes.get("/", ...industryOnly, listMine);
industryOpportunityRoutes.post("/", ...industryOnly, createMine);
industryOpportunityRoutes.get("/:id", ...industryOnly, getMine);
industryOpportunityRoutes.put("/:id", ...industryOnly, updateMine);
industryOpportunityRoutes.delete("/:id", ...industryOnly, removeMine);
industryOpportunityRoutes.patch("/:id/publish", ...industryOnly, publishMine);
industryOpportunityRoutes.patch("/:id/unpublish", ...industryOnly, unpublishMine);
industryOpportunityRoutes.patch("/:id/close", ...industryOnly, closeMine);

export { industryOpportunityRoutes };
