import { Router } from "express";
import { login, me, register, studentOnly } from "../controllers/authController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authenticate, me);
authRoutes.get("/student-only", authenticate, authorizeRoles("STUDENT"), studentOnly);

export { authRoutes };
