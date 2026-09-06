import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

export function getJwtSecret() {
  if (!env.jwtSecret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return env.jwtSecret;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: env.jwtExpiresIn });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
