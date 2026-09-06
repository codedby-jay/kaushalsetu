import { Router } from "express";
import { getOne, list, start, submit } from "../controllers/assessmentController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const assessmentRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

assessmentRoutes.get("/", ...studentOnly, list);
assessmentRoutes.get("/:id", ...studentOnly, getOne);
assessmentRoutes.post("/:id/start", ...studentOnly, start);
assessmentRoutes.post("/:id/submit", ...studentOnly, submit);

export { assessmentRoutes };
