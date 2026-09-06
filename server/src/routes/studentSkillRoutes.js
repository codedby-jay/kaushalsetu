import { Router } from "express";
import { addMine, listMine, removeMine, updateMine } from "../controllers/skillController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const studentSkillRoutes = Router();
const studentOnly = [authenticate, authorizeRoles("STUDENT")];

studentSkillRoutes.get("/", ...studentOnly, listMine);
studentSkillRoutes.post("/", ...studentOnly, addMine);
studentSkillRoutes.put("/:skillId", ...studentOnly, updateMine);
studentSkillRoutes.delete("/:skillId", ...studentOnly, removeMine);

export { studentSkillRoutes };
