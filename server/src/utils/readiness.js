import { matchBand } from "./matching.js";

export const PLACEMENT_READY_THRESHOLD = 60;

export function readinessFromCareerMatch(hasActiveCareerGoal, matchPercentage) {
  if (!hasActiveCareerGoal) {
    return {
      available: false,
      percentage: null,
      category: "INSUFFICIENT_DATA",
      label: "Insufficient Data",
      placementReady: false,
      band: null,
    };
  }

  const percentage = Number(matchPercentage) || 0;
  const { band } = matchBand(percentage);

  let category = "NEEDS_ATTENTION";
  let label = "Needs Attention";
  if (percentage >= 80) {
    category = "READY";
    label = "Ready";
  } else if (percentage >= 60) {
    category = "ALMOST_READY";
    label = "Almost Ready";
  } else if (percentage >= 40) {
    category = "DEVELOPING";
    label = "Developing";
  }

  return {
    available: true,
    percentage,
    category,
    label,
    placementReady: percentage >= PLACEMENT_READY_THRESHOLD,
    band,
  };
}

export function emptyReadinessDistribution() {
  return {
    READY: 0,
    ALMOST_READY: 0,
    DEVELOPING: 0,
    NEEDS_ATTENTION: 0,
    INSUFFICIENT_DATA: 0,
  };
}
