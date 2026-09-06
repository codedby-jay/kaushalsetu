import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken } from "../utils/jwt.js";
import { toPublicUser } from "../utils/user.js";
import { validateLogin, validateRegistration } from "../validators/authValidators.js";

const BCRYPT_ROUNDS = 10;

export async function registerUser(payload) {
  const input = validateRegistration(payload);

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });

    return toPublicUser(user);
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("Email is already registered", 409);
    }
    throw error;
  }
}

export async function loginUser(payload) {
  const input = validateLogin(payload);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AppError("Authentication required", 401);
  }

  return toPublicUser(user);
}
