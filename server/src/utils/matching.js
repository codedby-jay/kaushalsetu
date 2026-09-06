export const REQUIRED_WEIGHT = 1;
export const OPTIONAL_WEIGHT = 0.5;

export function matchBand(percentage) {
  const value = Number(percentage) || 0;
  if (value >= 80) {
    return { band: "EXCELLENT", label: "Excellent Match" };
  }
  if (value >= 60) {
    return { band: "GOOD", label: "Good Match" };
  }
  if (value >= 40) {
    return { band: "PARTIAL", label: "Partial Match" };
  }
  return { band: "LOW", label: "Low Match" };
}

function joinNames(names) {
  if (names.length === 0) {
    return "";
  }
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function skillName(requirement) {
  return requirement.name || requirement.skill?.name || "Skill";
}

export function buildMatchCopy(skills) {
  if (!skills.length) {
    return {
      summary: "No skill requirements are available for this opportunity.",
      recommendation: null,
    };
  }

  const matched = skills.filter((item) => item.status === "MATCHED").map((item) => item.skill);
  const gaps = skills.filter((item) => item.status !== "MATCHED");
  const gapNames = gaps.map((item) => item.skill);

  let summary;
  if (matched.length && gaps.length === 0) {
    summary = `Strong skill match on ${joinNames(matched)}.`;
  } else if (matched.length && gaps.length) {
    summary = `Strong match on ${joinNames(matched)}. Improve ${joinNames(gapNames)} to meet the opportunity requirement.`;
  } else {
    summary = `Skill gaps on ${joinNames(gapNames)}. Add or improve these skills to raise your match.`;
  }

  const topGap = [...gaps].sort((a, b) => b.gap - a.gap || a.skill.localeCompare(b.skill))[0];
  const recommendation = topGap
    ? `Improve ${topGap.skill} by ${topGap.gap} proficiency ${topGap.gap === 1 ? "point" : "points"} to meet this opportunity's requirement.`
    : "You currently meet the listed skill requirements.";

  return { summary, recommendation };
}

export function calculateMatch(studentSkills, opportunitySkills) {
  const studentBySkill = new Map();
  for (const item of studentSkills || []) {
    studentBySkill.set(item.skillId, Number(item.proficiency) || 0);
  }

  const requirements = opportunitySkills || [];
  if (requirements.length === 0) {
    const emptyBand = matchBand(0);
    return {
      matchPercentage: 0,
      ...emptyBand,
      matchedSkills: [],
      partialSkills: [],
      skillGaps: [],
      skills: [],
      summary: "No skill requirements are available for this opportunity.",
      recommendation: null,
    };
  }

  let contributions = 0;
  let weights = 0;
  const skills = [];

  for (const requirement of requirements) {
    const requiredProficiency = Number(requirement.requiredProficiency) || 0;
    const currentProficiency = studentBySkill.has(requirement.skillId)
      ? Number(studentBySkill.get(requirement.skillId)) || 0
      : 0;
    const isRequired = requirement.isRequired !== false;
    const weight = isRequired ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT;
    const scoreRatio =
      requiredProficiency <= 0
        ? 1
        : Math.min(currentProficiency / requiredProficiency, 1);

    contributions += scoreRatio * weight;
    weights += weight;

    let status = "GAP";
    if (requiredProficiency <= 0 || currentProficiency >= requiredProficiency) {
      status = "MATCHED";
    } else if (currentProficiency > 0) {
      status = "PARTIAL";
    }

    skills.push({
      skillId: requirement.skillId,
      skill: skillName(requirement),
      currentProficiency,
      requiredProficiency,
      isRequired,
      status,
      gap: Math.max(requiredProficiency - currentProficiency, 0),
      scoreRatio,
      weight,
    });
  }

  const matchPercentage = weights === 0 ? 0 : Math.round((contributions / weights) * 100);
  const band = matchBand(matchPercentage);
  const copy = buildMatchCopy(skills);

  const publicSkill = (item) => ({
    skillId: item.skillId,
    skill: item.skill,
    currentProficiency: item.currentProficiency,
    requiredProficiency: item.requiredProficiency,
    isRequired: item.isRequired,
    status: item.status,
    gap: item.gap,
  });

  return {
    matchPercentage,
    ...band,
    matchedSkills: skills.filter((item) => item.status === "MATCHED").map(publicSkill),
    partialSkills: skills.filter((item) => item.status === "PARTIAL").map(publicSkill),
    skillGaps: skills.filter((item) => item.status !== "MATCHED").map(publicSkill),
    skills: skills.map(publicSkill),
    summary: copy.summary,
    recommendation: copy.recommendation,
  };
}

export function compactMatch(result) {
  return {
    available: true,
    matchPercentage: result.matchPercentage,
    band: result.band,
    label: result.label,
    matchedCount: result.matchedSkills.length,
    partialCount: result.partialSkills.length,
    gapCount: result.skillGaps.length,
    summary: result.summary,
    skills: result.skills,
  };
}
