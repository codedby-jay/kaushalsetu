export function clampProficiency(value) {
  const n = Math.round(Number(value) || 0);
  if (n < 0) return 0;
  if (n > 10) return 10;
  return n;
}

export function percentageFromPoints(earned, available) {
  if (!available) {
    return 0;
  }
  return Math.round((earned / available) * 100);
}

export function proficiencyFromPercentage(percentage) {
  return clampProficiency(percentage / 10);
}

export function buildSkillResults(questions, scoredAnswers) {
  const bySkill = new Map();

  for (const question of questions) {
    const answer = scoredAnswers.get(question.id);
    const current = bySkill.get(question.skillId) || {
      skillId: question.skillId,
      skillName: question.skill?.name,
      correctCount: 0,
      questionCount: 0,
      pointsEarned: 0,
      pointsAvailable: 0,
    };
    current.questionCount += 1;
    current.pointsAvailable += question.points;
    if (answer?.isCorrect) {
      current.correctCount += 1;
    }
    current.pointsEarned += answer?.pointsEarned || 0;
    bySkill.set(question.skillId, current);
  }

  return [...bySkill.values()].map((item) => {
    const percentage = percentageFromPoints(item.pointsEarned, item.pointsAvailable);
    return {
      ...item,
      percentage,
      calculatedProficiency: proficiencyFromPercentage(percentage),
    };
  });
}

export function classifySkillResults(skillResults, target = 7) {
  const strengths = [];
  const developing = [];
  const skillGaps = [];

  for (const item of skillResults) {
    const row = {
      skillId: item.skillId,
      skill: item.skillName,
      proficiency: item.calculatedProficiency,
      percentage: item.percentage,
    };
    if (item.calculatedProficiency >= 7) {
      strengths.push(row);
    } else if (item.calculatedProficiency >= 4) {
      developing.push({ ...row, target, gap: Math.max(0, target - item.calculatedProficiency) });
    } else {
      skillGaps.push({ ...row, target, gap: Math.max(0, target - item.calculatedProficiency) });
    }
  }

  const recommendedFocus = [...skillGaps, ...developing]
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 5)
    .map((item) => item.skill);

  const overallScore =
    skillResults.length === 0
      ? 0
      : Math.round(
          skillResults.reduce((sum, item) => sum + item.percentage, 0) / skillResults.length,
        );

  return {
    overallScore,
    strengths,
    developing,
    skillGaps,
    recommendedFocus,
    skillResults,
  };
}
