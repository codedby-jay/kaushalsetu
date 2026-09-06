import { AppError } from "../utils/AppError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PUBLIC_ROLES = ["STUDENT", "INDUSTRY", "ACADEMICIAN", "INSTITUTION"];
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function validateRegistration({ name, email, password, role }) {
  const errors = {};
  const trimmedName = String(name || "").trim();

  if (!trimmedName) {
    errors.name = "Name is required";
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (String(password).length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (role === "ADMIN") {
    throw new AppError("Admin accounts cannot be created through public registration", 403);
  }

  if (role && !PUBLIC_ROLES.includes(role)) {
    errors.role = "Select a valid role";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return {
    name: trimmedName,
    email: normalizedEmail,
    password: String(password),
    role: role || "STUDENT",
  };
}

export function validateLogin({ email, password }) {
  const errors = {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return {
    email: normalizedEmail,
    password: String(password),
  };
}
