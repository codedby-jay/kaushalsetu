import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";

const healthRoutes = Router();

healthRoutes.get("/", healthCheck);

export { healthRoutes };
