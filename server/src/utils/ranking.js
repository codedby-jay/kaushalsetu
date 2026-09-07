export const RANKING_SORTS = ["match_desc", "match_asc", "applied_newest", "applied_oldest"];

export function requiredSkillCoverageFromMatch(match) {
  const skills = match?.skills || [];
  const required = skills.filter((item) => item.isRequired !== false);
  if (required.length === 0) {
    return {
      requiredSkillCoverage: 100,
      coveredRequiredCount: 0,
      requiredCount: 0,
    };
  }

  const coveredRequiredCount = required.filter((item) => item.status === "MATCHED").length;
  return {
    requiredSkillCoverage: Math.round((coveredRequiredCount / required.length) * 100),
    coveredRequiredCount,
    requiredCount: required.length,
  };
}

export function totalSkillGapFromMatch(match) {
  return (match?.skills || []).reduce((sum, item) => sum + (Number(item.gap) || 0), 0);
}

export function buildRankingMetadata(match) {
  return {
    ...requiredSkillCoverageFromMatch(match),
    totalSkillGap: totalSkillGapFromMatch(match),
  };
}

function appliedAtMs(appliedAt) {
  if (appliedAt instanceof Date) {
    return appliedAt.getTime();
  }
  return new Date(appliedAt).getTime();
}

function compareIds(a, b) {
  return String(a.id).localeCompare(String(b.id));
}

export function compareByFit(a, b) {
  if (b.matchPercentage !== a.matchPercentage) {
    return b.matchPercentage - a.matchPercentage;
  }
  if (b.requiredSkillCoverage !== a.requiredSkillCoverage) {
    return b.requiredSkillCoverage - a.requiredSkillCoverage;
  }
  if (a.totalSkillGap !== b.totalSkillGap) {
    return a.totalSkillGap - b.totalSkillGap;
  }
  const time = appliedAtMs(a.appliedAt) - appliedAtMs(b.appliedAt);
  if (time !== 0) {
    return time;
  }
  return compareIds(a, b);
}

export function compareCandidates(a, b, sort = "match_desc") {
  if (sort === "applied_newest") {
    const time = appliedAtMs(b.appliedAt) - appliedAtMs(a.appliedAt);
    return time !== 0 ? time : compareIds(a, b);
  }
  if (sort === "applied_oldest") {
    const time = appliedAtMs(a.appliedAt) - appliedAtMs(b.appliedAt);
    return time !== 0 ? time : compareIds(a, b);
  }

  if (sort === "match_asc") {
    if (a.matchPercentage !== b.matchPercentage) {
      return a.matchPercentage - b.matchPercentage;
    }
    if (b.requiredSkillCoverage !== a.requiredSkillCoverage) {
      return b.requiredSkillCoverage - a.requiredSkillCoverage;
    }
    if (a.totalSkillGap !== b.totalSkillGap) {
      return a.totalSkillGap - b.totalSkillGap;
    }
    const time = appliedAtMs(a.appliedAt) - appliedAtMs(b.appliedAt);
    if (time !== 0) {
      return time;
    }
    return compareIds(a, b);
  }

  return compareByFit(a, b);
}

export function assignFitRanks(items) {
  const ordered = [...items].sort(compareByFit);
  const rankById = new Map(ordered.map((item, index) => [item.id, index + 1]));
  return items.map((item) => ({
    ...item,
    rank: rankById.get(item.id),
  }));
}

export function rankCandidates(items, sort = "match_desc") {
  const withRanks = assignFitRanks(items);
  return [...withRanks].sort((a, b) => compareCandidates(a, b, sort));
}
