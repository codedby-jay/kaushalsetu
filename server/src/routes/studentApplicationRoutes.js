import { Router } from "express";
import { getMine, listMine, withdrawMine } from "../controllers/studentApplicationController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentApplicationRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

studentApplicationRoutes.get("/applications", ...studentOnly, listMine);
studentApplicationRoutes.get("/applications/:id", ...studentOnly, getMine);
studentApplicationRoutes.patch("/applications/:id/withdraw", ...studentOnly, withdrawMine);

export { studentApplicationRoutes };
