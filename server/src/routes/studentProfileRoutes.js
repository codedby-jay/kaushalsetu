import { Router } from "express";
import {
  createProfile,
  getProfile,
  removeProfile,
  updateProfile,
} from "../controllers/studentProfileController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentProfileRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

studentProfileRoutes.get("/", ...studentOnly, getProfile);
studentProfileRoutes.post("/", ...studentOnly, createProfile);
studentProfileRoutes.put("/", ...studentOnly, updateProfile);
studentProfileRoutes.delete("/", ...studentOnly, removeProfile);

export { studentProfileRoutes };
