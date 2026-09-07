import { Router } from "express";
import {
  academicianDashboard,
  industryDashboard,
  institutionDashboard,
  studentDashboard,
} from "../controllers/dashboardController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentDashboardRoutes = Router();
studentDashboardRoutes.get(
  "/dashboard",
  authenticate,
  authorizeRoles("STUDENT"),
  studentDashboard,
);

const industryDashboardRoutes = Router();
industryDashboardRoutes.get(
  "/dashboard",
  authenticate,
  authorizeRoles("INDUSTRY"),
  industryDashboard,
);

const institutionDashboardRoutes = Router();
institutionDashboardRoutes.get(
  "/dashboard",
  authenticate,
  authorizeRoles("INSTITUTION"),
  institutionDashboard,
);

const academicianDashboardRoutes = Router();
academicianDashboardRoutes.get(
  "/dashboard",
  authenticate,
  authorizeRoles("ACADEMICIAN"),
  academicianDashboard,
);

export {
  studentDashboardRoutes,
  industryDashboardRoutes,
  institutionDashboardRoutes,
  academicianDashboardRoutes,
};
