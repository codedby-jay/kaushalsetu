import { AppError } from "../utils/AppError.js";
import { APPLICATION_STATUSES } from "../utils/application.js";
import { RANKING_SORTS } from "../utils/ranking.js";

const MAX_COVER_LETTER = 4000;
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

export function validateApplyPayload(body = {}) {
  const errors = {};

  if (
    body.studentId !== undefined ||
    body.userId !== undefined ||
    body.studentProfileId !== undefined
  ) {
    errors.ownership = "Applicant identity is determined from your signed-in account";
  }

  let coverLetter = null;
  if (body.coverLetter !== undefined && body.coverLetter !== null) {
    coverLetter = emptyToNull(body.coverLetter);
    if (coverLetter && coverLetter.length > MAX_COVER_LETTER) {
      errors.coverLetter = `Cover letter must be at most ${MAX_COVER_LETTER} characters`;
    }
  }

  let resumeUrl = null;
  if (body.resumeUrl !== undefined && body.resumeUrl !== null) {
    resumeUrl = emptyToNull(body.resumeUrl);
    if (resumeUrl && (resumeUrl.length > MAX_URL || !isHttpUrl(resumeUrl))) {
      errors.resumeUrl = "Enter a valid http(s) URL";
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return { coverLetter, resumeUrl };
}

export function validateStatusPayload(body = {}) {
  const status = emptyToNull(body?.status);
  if (!status || !APPLICATION_STATUSES.includes(status)) {
    throw new AppError("Validation failed", 400, {
      status: "Select a valid application status",
    });
  }
  return status;
}

export function parseApplicationFilters(query = {}) {
  const filters = {};

  if (query.status) {
    const status = String(query.status).trim().toUpperCase();
    if (!APPLICATION_STATUSES.includes(status)) {
      throw new AppError("Validation failed", 400, { status: "Invalid application status" });
    }
    filters.status = status;
  }

  if (query.search) {
    filters.search = String(query.search).trim();
  }

  return filters;
}

export function parseIndustryCandidateFilters(query = {}) {
  const filters = parseApplicationFilters(query);

  const sortRaw = query.sort === undefined || query.sort === null || query.sort === ""
    ? "match_desc"
    : String(query.sort).trim();
  if (!RANKING_SORTS.includes(sortRaw)) {
    throw new AppError("Validation failed", 400, { sort: "Invalid sort option" });
  }
  filters.sort = sortRaw;

  if (query.minMatch !== undefined && query.minMatch !== null && query.minMatch !== "") {
    const minMatch = Number(query.minMatch);
    if (!Number.isInteger(minMatch) || minMatch < 0 || minMatch > 100) {
      throw new AppError("Validation failed", 400, {
        minMatch: "minMatch must be an integer from 0 to 100",
      });
    }
    filters.minMatch = minMatch;
  }

  const include = String(query.includeWithdrawn ?? "").trim().toLowerCase();
  filters.includeWithdrawn = include === "true" || include === "1";

  return filters;
}
