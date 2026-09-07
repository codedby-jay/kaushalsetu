export function requiredSkillsLabel(ranking) {
  if (!ranking) {
    return "—";
  }
  if (!ranking.requiredCount) {
    return "No required skills";
  }
  return `${ranking.coveredRequiredCount}/${ranking.requiredCount} required skills`;
}

export const CANDIDATE_STATUS_FILTERS = [
  { id: "active", label: "Active" },
  { id: "all", label: "All" },
  { id: "APPLIED", label: "Applied" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "SHORTLISTED", label: "Shortlisted" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "SELECTED", label: "Selected" },
  { id: "REJECTED", label: "Rejected" },
  { id: "WITHDRAWN", label: "Withdrawn" },
];

export const CANDIDATE_SORT_OPTIONS = [
  { value: "match_desc", label: "Best fit" },
  { value: "match_asc", label: "Lowest match" },
  { value: "applied_newest", label: "Applied newest" },
  { value: "applied_oldest", label: "Applied oldest" },
];
