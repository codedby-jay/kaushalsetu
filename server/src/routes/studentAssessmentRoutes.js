import { Router } from "express";
import { history, intelligence, result } from "../controllers/assessmentController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentAssessmentRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

studentAssessmentRoutes.get("/assessments/history", ...studentOnly, history);
studentAssessmentRoutes.get("/assessment-results/:attemptId", ...studentOnly, result);
studentAssessmentRoutes.get("/skill-intelligence", ...studentOnly, intelligence);

export { studentAssessmentRoutes };
