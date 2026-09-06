import { Router } from "express";
import { assessmentRoutes } from "./assessmentRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { skillCatalogRoutes } from "./skillRoutes.js";
import { studentAssessmentRoutes } from "./studentAssessmentRoutes.js";
import { studentProfileRoutes } from "./studentProfileRoutes.js";
import { studentSkillRoutes } from "./studentSkillRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/student/profile", studentProfileRoutes);
apiRouter.use("/student/skills", studentSkillRoutes);
apiRouter.use("/student", studentAssessmentRoutes);
apiRouter.use("/skills", skillCatalogRoutes);
apiRouter.use("/assessments", assessmentRoutes);

export { apiRouter };
