import { AppError } from "../utils/AppError.js";

const MAX_NAME = 160;
const MAX_DESCRIPTION = 4000;
const MAX_SHORT = 120;
const MAX_URL = 500;

function emptyToNull(value) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCompanyProfilePayload(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  const requiredStrings = ["companyName", "description", "industry"];
  for (const field of requiredStrings) {
    if (partial && body[field] === undefined) {
      continue;
    }
    const value = emptyToNull(body[field]);
    if (!value) {
      errors[field] = `${field === "companyName" ? "Company name" : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      data[field] = value;
    }
  }

  if (data.companyName && data.companyName.length > MAX_NAME) {
    errors.companyName = `Company name must be at most ${MAX_NAME} characters`;
  }
  if (data.description && data.description.length > MAX_DESCRIPTION) {
    errors.description = `Description must be at most ${MAX_DESCRIPTION} characters`;
  }
  if (data.industry && data.industry.length > MAX_SHORT) {
    errors.industry = `Industry must be at most ${MAX_SHORT} characters`;
  }

  for (const field of ["location", "companySize"]) {
    if (partial && body[field] === undefined) {
      continue;
    }
    if (!partial && body[field] === undefined) {
      data[field] = null;
      continue;
    }
    data[field] = emptyToNull(body[field]);
    if (data[field] && data[field].length > MAX_SHORT) {
      errors[field] = `Must be at most ${MAX_SHORT} characters`;
    }
  }

  for (const field of ["website", "logoUrl"]) {
    if (partial && body[field] === undefined) {
      continue;
    }
    if (!partial && body[field] === undefined) {
      data[field] = null;
      continue;
    }
    data[field] = emptyToNull(body[field]);
    if (data[field] && (data[field].length > MAX_URL || !isHttpUrl(data[field]))) {
      errors[field] = "Enter a valid http(s) URL";
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return data;
}
