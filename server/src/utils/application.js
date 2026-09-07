import { compactMatch } from "./matching.js";
import { serializeOpportunity } from "./opportunity.js";
import { serializeProfile } from "./student.js";

export const APPLICATION_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

export const TERMINAL_STATUSES = ["SELECTED", "REJECTED", "WITHDRAWN"];

export const STUDENT_WITHDRAWABLE = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED"];

export const INDUSTRY_TRANSITIONS = {
  APPLIED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["SELECTED", "REJECTED"],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const HAPPY_PATH = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED"];

export function canStudentWithdraw(status) {
  return STUDENT_WITHDRAWABLE.includes(status);
}

export function allowedIndustryTransitions(status) {
  return INDUSTRY_TRANSITIONS[status] || [];
}

export function isValidIndustryTransition(from, to) {
  return allowedIndustryTransitions(from).includes(to);
}

export function serializeApplicant(profile) {
  if (!profile) {
    return null;
  }

  const user = profile.user;
  return {
    name: user?.name || "",
    email: user?.email || "",
    ...serializeProfile(profile),
  };
}

export function serializeApplication(record, { match = null, viewer = "student" } = {}) {
  const opportunity = record.opportunity
    ? serializeOpportunity(record.opportunity, {
        includeStatus: viewer === "industry",
      })
    : null;

  const payload = {
    id: record.id,
    status: record.status,
    coverLetter: record.coverLetter,
    resumeUrl: record.resumeUrl,
    appliedAt: record.appliedAt,
    updatedAt: record.updatedAt,
    opportunity,
    match,
    timeline: buildTimeline(record),
  };

  if (viewer === "industry") {
    payload.applicant = serializeApplicant(record.profile);
  }

  return payload;
}

export function compactApplication(record, { match = null } = {}) {
  return {
    id: record.id,
    status: record.status,
    appliedAt: record.appliedAt,
    updatedAt: record.updatedAt,
    opportunity: record.opportunity
      ? serializeOpportunity(record.opportunity, { includeStatus: false })
      : null,
    match: match ? compactMatch(match) : null,
  };
}

export function myApplicationSummary(record) {
  if (!record) {
    return null;
  }
  return {
    id: record.id,
    status: record.status,
    appliedAt: record.appliedAt,
  };
}

export function buildTimeline(record) {
  const steps = [];
  steps.push({
    status: "APPLIED",
    label: "Applied",
    at: record.appliedAt,
    state: "complete",
  });

  if (record.status === "WITHDRAWN") {
    steps.push({
      status: "WITHDRAWN",
      label: "Withdrawn",
      at: record.updatedAt,
      state: "complete",
    });
    return steps;
  }

  if (record.status === "REJECTED") {
    steps.push({
      status: "REJECTED",
      label: "Rejected",
      at: record.updatedAt,
      state: "complete",
    });
    return steps;
  }

  const currentIndex = HAPPY_PATH.indexOf(record.status);
  if (currentIndex <= 0) {
    return steps;
  }

  for (let index = 1; index <= currentIndex; index += 1) {
    const status = HAPPY_PATH[index];
    steps.push({
      status,
      label: statusLabel(status),
      at: index === currentIndex ? record.updatedAt : null,
      state: "complete",
    });
  }

  return steps;
}

export function statusLabel(status) {
  const labels = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
  };
  return labels[status] || status;
}

export const applicationInclude = {
  opportunity: {
    include: {
      company: true,
      skills: {
        include: { skill: true },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { applications: true },
      },
    },
  },
  profile: {
    include: {
      user: true,
      skills: true,
    },
  },
};
