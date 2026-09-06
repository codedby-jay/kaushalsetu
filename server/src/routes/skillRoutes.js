import { Router } from "express";
import { listCatalog } from "../controllers/skillController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const skillCatalogRoutes = Router();

skillCatalogRoutes.get("/", authenticate, listCatalog);

export { skillCatalogRoutes };
