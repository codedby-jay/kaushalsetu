import { getHealthStatus } from "../services/healthService.js";

export async function healthCheck(req, res, next) {
  try {
    const payload = await getHealthStatus();
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}
