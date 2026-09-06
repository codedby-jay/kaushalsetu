import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAccessToken(token);

    if (!payload?.userId || !payload?.role) {
      throw new AppError("Invalid or expired token", 401);
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user?.role) {
        throw new AppError("Authentication required", 401);
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError("Access denied", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
