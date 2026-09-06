import { Router } from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/companyProfileController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const industryCompanyRoutes = Router();
const industryOnly = [authenticate, authorizeRoles("INDUSTRY")];

industryCompanyRoutes.get("/", ...industryOnly, getProfile);
industryCompanyRoutes.post("/", ...industryOnly, createProfile);
industryCompanyRoutes.put("/", ...industryOnly, updateProfile);

export { industryCompanyRoutes };
