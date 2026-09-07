export function safePercent(numerator, denominator) {
  const den = Number(denominator) || 0;
  if (den <= 0) {
    return 0;
  }
  return Math.round(((Number(numerator) || 0) / den) * 100);
}

export function demandLevel(opportunityCount, publishedCount) {
  const count = Number(opportunityCount) || 0;
  const published = Number(publishedCount) || 0;
  if (count <= 0 || published <= 0) {
    return "LOW";
  }
  const share = count / published;
  if (share >= 0.4) {
    return "HIGH";
  }
  if (share >= 0.2) {
    return "MEDIUM";
  }
  return "LOW";
}

export function proficiencyLevel(averageProficiency) {
  const value = Number(averageProficiency) || 0;
  if (value >= 7) {
    return "HIGH";
  }
  if (value >= 4) {
    return "MEDIUM";
  }
  return "LOW";
}

export function demandLabel(level) {
  if (level === "HIGH") {
    return "High";
  }
  if (level === "MEDIUM") {
    return "Medium";
  }
  return "Low";
}

export function buildSkillDemandInsight({ skillName, demand, proficiency }) {
  const name = skillName || "This skill";
  const demandWord =
    demand === "HIGH"
      ? "highly demanded"
      : demand === "MEDIUM"
        ? "moderately demanded"
        : "less frequently demanded";
  const proficiencyWord =
    proficiency === "HIGH" ? "high" : proficiency === "MEDIUM" ? "moderate" : "low";

  let gap = "Low priority";
  let action = `No urgent training action for ${name}`;

  if (proficiency === "HIGH") {
    gap = "Aligned";
    action = `Maintain ${name} coverage`;
  } else if (demand === "HIGH" && proficiency === "LOW") {
    gap = "Significant";
    action = `Industry-oriented ${name} training`;
  } else if (
    (demand === "HIGH" && proficiency === "MEDIUM") ||
    (demand === "MEDIUM" && proficiency === "LOW")
  ) {
    gap = "Notable";
    action =
      demand === "HIGH"
        ? `Strengthen ${name} with applied practice`
        : `Add ${name} to core curriculum`;
  } else if (demand === "MEDIUM" && proficiency === "MEDIUM") {
    gap = "Watch";
    action = `Monitor ${name} vs listings`;
  } else if (demand === "LOW") {
    gap = "Low priority";
    action = `No urgent training action for ${name}`;
  }

  return {
    skill: name,
    demand,
    demandLabel: demandLabel(demand),
    proficiency,
    proficiencyLabel: demandLabel(proficiency),
    gap,
    recommendedAction: action,
    summary: `${name} is ${demandWord} by industry, but average student proficiency is ${proficiencyWord}.`,
  };
}

export function computeCareerSkillGapRates(students) {
  const bySkill = new Map();

  for (const student of students || []) {
    const role = student.careerGoal?.careerRole;
    if (!role?.isActive) {
      continue;
    }

    const proficiencyBySkill = new Map(
      (student.skills || []).map((item) => [item.skillId, Number(item.proficiency) || 0]),
    );

    for (const requirement of role.skills || []) {
      const current = proficiencyBySkill.has(requirement.skillId)
        ? proficiencyBySkill.get(requirement.skillId)
        : 0;
      const required = Number(requirement.requiredProficiency) || 0;
      const name = requirement.skill?.name || "Skill";
      const existing = bySkill.get(requirement.skillId) || {
        skillId: requirement.skillId,
        skill: name,
        students: 0,
        withGap: 0,
      };
      existing.students += 1;
      if (current < required) {
        existing.withGap += 1;
      }
      bySkill.set(requirement.skillId, existing);
    }
  }

  return [...bySkill.values()]
    .map((item) => ({
      skill: item.skill,
      students: item.students,
      withGap: item.withGap,
      gapRatePercent: safePercent(item.withGap, item.students),
    }))
    .sort(
      (a, b) =>
        b.gapRatePercent - a.gapRatePercent ||
        b.students - a.students ||
        a.skill.localeCompare(b.skill),
    );
}
