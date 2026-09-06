export function formatOpportunityDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateInputValue(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

export function workModeLabel(mode) {
  if (mode === "ONSITE") {
    return "On-site";
  }
  if (mode === "REMOTE") {
    return "Remote";
  }
  if (mode === "HYBRID") {
    return "Hybrid";
  }
  return mode || "—";
}

export function typeLabel(type) {
  if (type === "INTERNSHIP") {
    return "Internship";
  }
  if (type === "JOB") {
    return "Job";
  }
  if (type === "APPRENTICESHIP") {
    return "Apprenticeship";
  }
  return type || "—";
}

export function statusBadgeVariant(status) {
  if (status === "PUBLISHED") {
    return "success";
  }
  if (status === "CLOSED") {
    return "danger";
  }
  return "default";
}

export function compensationText(opportunity) {
  if (opportunity?.stipend != null) {
    return `₹${Number(opportunity.stipend).toLocaleString("en-IN")}/month`;
  }
  if (opportunity?.salaryMin != null || opportunity?.salaryMax != null) {
    const min = opportunity.salaryMin != null
      ? `₹${Number(opportunity.salaryMin).toLocaleString("en-IN")}`
      : "";
    const max = opportunity.salaryMax != null
      ? `₹${Number(opportunity.salaryMax).toLocaleString("en-IN")}`
      : "";
    if (min && max) {
      return `${min} – ${max} / year`;
    }
    return `${min || max} / year`;
  }
  return "Not specified";
}
