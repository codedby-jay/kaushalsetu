import { Router } from "express";
import { assessmentRoutes } from "./assessmentRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { industryApplicationRoutes } from "./industryApplicationRoutes.js";
import { industryCompanyRoutes } from "./industryCompanyRoutes.js";
import { industryOpportunityRoutes } from "./industryOpportunityRoutes.js";
import { opportunityBrowseRoutes } from "./opportunityBrowseRoutes.js";
import { skillCatalogRoutes } from "./skillRoutes.js";
import { studentApplicationRoutes } from "./studentApplicationRoutes.js";
import { studentAssessmentRoutes } from "./studentAssessmentRoutes.js";
import { studentProfileRoutes } from "./studentProfileRoutes.js";
import { studentSkillRoutes } from "./studentSkillRoutes.js";
import { careerRoleRoutes } from "./careerRoleRoutes.js";
import { studentCareerRoutes } from "./studentCareerRoutes.js";
import {
  academicianDashboardRoutes,
  industryDashboardRoutes,
  institutionDashboardRoutes,
  studentDashboardRoutes,
} from "./dashboardRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/student/profile", studentProfileRoutes);
apiRouter.use("/student/skills", studentSkillRoutes);
apiRouter.use("/student", studentAssessmentRoutes);
apiRouter.use("/student", studentCareerRoutes);
apiRouter.use("/student", studentApplicationRoutes);
apiRouter.use("/student", studentDashboardRoutes);
apiRouter.use("/industry", industryDashboardRoutes);
apiRouter.use("/institution", institutionDashboardRoutes);
apiRouter.use("/academician", academicianDashboardRoutes);
apiRouter.use("/skills", skillCatalogRoutes);
apiRouter.use("/assessments", assessmentRoutes);
apiRouter.use("/career-roles", careerRoleRoutes);
apiRouter.use("/industry/company-profile", industryCompanyRoutes);
apiRouter.use("/industry/opportunities", industryOpportunityRoutes);
apiRouter.use("/industry/applications", industryApplicationRoutes);
apiRouter.use("/opportunities", opportunityBrowseRoutes);

export { apiRouter };
