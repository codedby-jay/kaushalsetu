export const APPLICATION_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

export function applicationStatusLabel(status) {
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

export function applicationStatusVariant(status) {
  if (status === "SELECTED" || status === "SHORTLISTED") {
    return "success";
  }
  if (status === "INTERVIEW" || status === "UNDER_REVIEW") {
    return "primary";
  }
  if (status === "REJECTED" || status === "WITHDRAWN") {
    return "danger";
  }
  return "warning";
}

export function canWithdraw(status) {
  return status === "APPLIED" || status === "UNDER_REVIEW" || status === "SHORTLISTED";
}

export function industryStatusActions(status) {
  if (status === "APPLIED") {
    return [{ status: "UNDER_REVIEW", label: "Start review", variant: "primary" }];
  }
  if (status === "UNDER_REVIEW") {
    return [
      { status: "SHORTLISTED", label: "Shortlist", variant: "primary" },
      { status: "REJECTED", label: "Reject", variant: "secondary" },
    ];
  }
  if (status === "SHORTLISTED") {
    return [
      { status: "INTERVIEW", label: "Move to interview", variant: "primary" },
      { status: "REJECTED", label: "Reject", variant: "secondary" },
    ];
  }
  if (status === "INTERVIEW") {
    return [
      { status: "SELECTED", label: "Select", variant: "primary" },
      { status: "REJECTED", label: "Reject", variant: "secondary" },
    ];
  }
  return [];
}
