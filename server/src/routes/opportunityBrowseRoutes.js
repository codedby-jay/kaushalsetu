import { Router } from "express";
import { getPublished, listPublished } from "../controllers/opportunityBrowseController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const opportunityBrowseRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

opportunityBrowseRoutes.get("/", ...studentOnly, listPublished);
opportunityBrowseRoutes.get("/:id", ...studentOnly, getPublished);

export { opportunityBrowseRoutes };
