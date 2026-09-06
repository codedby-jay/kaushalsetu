import { Router } from "express";
import { getRole, listRoles } from "../controllers/careerController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const careerRoleRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

careerRoleRoutes.get("/", ...studentOnly, listRoles);
careerRoleRoutes.get("/:id", ...studentOnly, getRole);

export { careerRoleRoutes };
