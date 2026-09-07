import { Router } from "express";
import { getOwned, updateStatus } from "../controllers/industryApplicationController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const industryApplicationRoutes = Router();
const industryOnly = [authenticate, authorizeRoles("INDUSTRY")];

industryApplicationRoutes.get("/:id", ...industryOnly, getOwned);
industryApplicationRoutes.patch("/:id/status", ...industryOnly, updateStatus);

export { industryApplicationRoutes };
