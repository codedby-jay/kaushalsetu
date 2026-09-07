import { Router } from "express";
import { apply } from "../controllers/studentApplicationController.js";
import { getMatch, getPublished, listPublished } from "../controllers/opportunityBrowseController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const opportunityBrowseRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

opportunityBrowseRoutes.get("/", ...studentOnly, listPublished);
opportunityBrowseRoutes.post("/:id/apply", ...studentOnly, apply);
opportunityBrowseRoutes.get("/:id/match", ...studentOnly, getMatch);
opportunityBrowseRoutes.get("/:id", ...studentOnly, getPublished);

export { opportunityBrowseRoutes };
