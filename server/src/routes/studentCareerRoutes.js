import { Router } from "express";
import { getGoal, getRoadmap, putGoal } from "../controllers/careerController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentCareerRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

studentCareerRoutes.get("/career-goal", ...studentOnly, getGoal);
studentCareerRoutes.put("/career-goal", ...studentOnly, putGoal);
studentCareerRoutes.get("/career-roadmap", ...studentOnly, getRoadmap);

export { studentCareerRoutes };
