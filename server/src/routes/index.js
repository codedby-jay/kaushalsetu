import { Router } from "express";
import { assessmentRoutes } from "./assessmentRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { industryCompanyRoutes } from "./industryCompanyRoutes.js";
import { industryOpportunityRoutes } from "./industryOpportunityRoutes.js";
import { opportunityBrowseRoutes } from "./opportunityBrowseRoutes.js";
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
apiRouter.use("/industry/company-profile", industryCompanyRoutes);
apiRouter.use("/industry/opportunities", industryOpportunityRoutes);
apiRouter.use("/opportunities", opportunityBrowseRoutes);

export { apiRouter };
