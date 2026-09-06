import { AppError } from "../utils/AppError.js";

const MAX_HEADLINE = 160;
const MAX_BIO = 2000;
const MAX_SHORT = 120;
const MAX_URL = 500;
const URL_FIELDS = ["githubUrl", "linkedinUrl", "portfolioUrl"];
const OPTIONAL_STRINGS = [
  "headline",
  "bio",
  "phone",
  "location",
  "education",
  "college",
  "degree",
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
];

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

export function validateProfilePayload(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  for (const field of OPTIONAL_STRINGS) {
    if (!partial && body[field] === undefined) {
      data[field] = null;
      continue;
    }
    if (body[field] === undefined) {
      continue;
    }
    data[field] = emptyToNull(body[field]);
  }

  if (data.headline && data.headline.length > MAX_HEADLINE) {
    errors.headline = `Headline must be at most ${MAX_HEADLINE} characters`;
  }
  if (data.bio && data.bio.length > MAX_BIO) {
    errors.bio = `Bio must be at most ${MAX_BIO} characters`;
  }
  for (const field of ["phone", "location", "education", "college", "degree"]) {
    if (data[field] && data[field].length > MAX_SHORT) {
      errors[field] = `Must be at most ${MAX_SHORT} characters`;
    }
  }

  for (const field of URL_FIELDS) {
    if (data[field] && (data[field].length > MAX_URL || !isHttpUrl(data[field]))) {
      errors[field] = "Enter a valid http(s) URL";
    }
  }

  if (!partial || body.graduationYear !== undefined) {
    if (body.graduationYear === "" || body.graduationYear === null) {
      data.graduationYear = null;
    } else if (body.graduationYear !== undefined) {
      const year = Number(body.graduationYear);
      const current = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1980 || year > current + 8) {
        errors.graduationYear = "Enter a valid graduation year";
      } else {
        data.graduationYear = year;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return data;
}
