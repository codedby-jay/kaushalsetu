import { AppError } from "../utils/AppError.js";
import { validateProficiency, validateSkillId } from "./skillValidators.js";

const MAX_TITLE = 160;
const MAX_DESCRIPTION = 4000;
const MAX_SHORT = 120;
const OPPORTUNITY_TYPES = ["INTERNSHIP", "APPRENTICESHIP", "JOB"];
const WORK_MODES = ["ONSITE", "REMOTE", "HYBRID"];

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

function requireString(body, field, label, errors, data, { max, partial }) {
  if (partial && body[field] === undefined) {
    return;
  }
  const value = emptyToNull(body[field]);
  if (!value) {
    errors[field] = `${label} is required`;
    return;
  }
  if (value.length > max) {
    errors[field] = `${label} must be at most ${max} characters`;
    return;
  }
  data[field] = value;
}

function optionalString(body, field, label, errors, data, { max, partial }) {
  if (partial && body[field] === undefined) {
    return;
  }
  if (!partial && body[field] === undefined) {
    data[field] = null;
    return;
  }
  const value = emptyToNull(body[field]);
  if (value && value.length > max) {
    errors[field] = `${label} must be at most ${max} characters`;
    return;
  }
  data[field] = value;
}

function optionalNonNegativeInt(body, field, label, errors, data, { partial }) {
  if (partial && body[field] === undefined) {
    return;
  }
  if (body[field] === "" || body[field] === null || (!partial && body[field] === undefined)) {
    data[field] = null;
    return;
  }
  const value = Number(body[field]);
  if (!Number.isInteger(value) || value < 0) {
    errors[field] = `${label} must be a non-negative integer`;
    return;
  }
  data[field] = value;
}

function optionalDeadline(body, errors, data, { partial }) {
  if (partial && body.applicationDeadline === undefined) {
    return;
  }
  if (
    body.applicationDeadline === "" ||
    body.applicationDeadline === null ||
    (!partial && body.applicationDeadline === undefined)
  ) {
    data.applicationDeadline = null;
    return;
  }
  const parsed = new Date(body.applicationDeadline);
  if (Number.isNaN(parsed.getTime())) {
    errors.applicationDeadline = "Enter a valid application deadline";
    return;
  }
  data.applicationDeadline = parsed;
}

export function validateOpportunitySkills(rawSkills) {
  if (rawSkills === undefined) {
    return undefined;
  }
  if (!Array.isArray(rawSkills)) {
    throw new AppError("Validation failed", 400, {
      skills: "Skills must be an array",
    });
  }

  const seen = new Set();
  const skills = [];

  for (const [index, item] of rawSkills.entries()) {
    try {
      const skillId = validateSkillId(item?.skillId);
      if (seen.has(skillId)) {
        throw new AppError("Validation failed", 400, {
          skills: "Each skill can be added only once",
        });
      }
      seen.add(skillId);
      skills.push({
        skillId,
        requiredProficiency: validateProficiency(item?.requiredProficiency),
        isRequired: item?.isRequired === false ? false : true,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw new AppError("Validation failed", 400, {
          skills: error.errors?.skillId || error.errors?.proficiency || error.errors?.skills || error.message,
          index,
        });
      }
      throw error;
    }
  }

  return skills;
}

export function validateOpportunityPayload(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  requireString(body, "title", "Title", errors, data, { max: MAX_TITLE, partial });
  requireString(body, "description", "Description", errors, data, {
    max: MAX_DESCRIPTION,
    partial,
  });
  requireString(body, "location", "Location", errors, data, { max: MAX_SHORT, partial });

  if (!partial || body.type !== undefined) {
    const type = emptyToNull(body.type);
    if (!type || !OPPORTUNITY_TYPES.includes(type)) {
      errors.type = "Select a valid opportunity type";
    } else {
      data.type = type;
    }
  }

  if (!partial || body.workMode !== undefined) {
    const workMode = emptyToNull(body.workMode);
    if (!workMode || !WORK_MODES.includes(workMode)) {
      errors.workMode = "Select a valid work mode";
    } else {
      data.workMode = workMode;
    }
  }

  optionalString(body, "duration", "Duration", errors, data, { max: MAX_SHORT, partial });
  optionalNonNegativeInt(body, "stipend", "Stipend", errors, data, { partial });
  optionalNonNegativeInt(body, "salaryMin", "Minimum salary", errors, data, { partial });
  optionalNonNegativeInt(body, "salaryMax", "Maximum salary", errors, data, { partial });
  optionalDeadline(body, errors, data, { partial });

  if (
    data.salaryMin != null &&
    data.salaryMax != null &&
    data.salaryMin > data.salaryMax
  ) {
    errors.salaryMin = "Minimum salary cannot be greater than maximum salary";
  }

  if (body.userId !== undefined || body.companyProfileId !== undefined) {
    errors.ownership = "Ownership is determined from your signed-in account";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  const skills = validateOpportunitySkills(body.skills);
  return { data, skills };
}

export function assertPublishable(opportunity, skills) {
  const errors = {};
  if (!opportunity.title?.trim()) {
    errors.title = "Title is required";
  }
  if (!opportunity.description?.trim()) {
    errors.description = "Description is required";
  }
  if (!opportunity.type) {
    errors.type = "Type is required";
  }
  if (!opportunity.workMode) {
    errors.workMode = "Work mode is required";
  }
  if (!opportunity.location?.trim()) {
    errors.location = "Location is required";
  }
  if (!skills?.length) {
    errors.skills = "Add at least one required skill before publishing";
  }
  if (opportunity.applicationDeadline) {
    const deadline = new Date(opportunity.applicationDeadline);
    if (deadline.getTime() < Date.now()) {
      errors.applicationDeadline = "Application deadline must be in the future";
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Opportunity cannot be published", 400, errors);
  }
}

export function parseBrowseFilters(query = {}) {
  const filters = {};

  if (query.type) {
    const type = String(query.type).trim().toUpperCase();
    if (!OPPORTUNITY_TYPES.includes(type)) {
      throw new AppError("Validation failed", 400, { type: "Invalid opportunity type" });
    }
    filters.type = type;
  }

  if (query.workMode) {
    const workMode = String(query.workMode).trim().toUpperCase();
    if (!WORK_MODES.includes(workMode)) {
      throw new AppError("Validation failed", 400, { workMode: "Invalid work mode" });
    }
    filters.workMode = workMode;
  }

  if (query.location) {
    filters.location = String(query.location).trim();
  }

  if (query.search) {
    filters.search = String(query.search).trim();
  }

  return filters;
}
