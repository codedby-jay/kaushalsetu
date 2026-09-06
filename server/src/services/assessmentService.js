import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  buildSkillResults,
  classifySkillResults,
  percentageFromPoints,
} from "../utils/assessmentScoring.js";
import { validateSubmitPayload } from "../validators/assessmentValidators.js";

function publicQuestion(question) {
  return {
    id: question.id,
    skillId: question.skillId,
    skillName: question.skill?.name,
    questionText: question.questionText,
    options: question.options,
    difficulty: question.difficulty,
    points: question.points,
    sortOrder: question.sortOrder,
  };
}

function publicAssessment(assessment, { includeQuestions = false } = {}) {
  const payload = {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    questionCount: assessment.questions?.length ?? assessment._count?.questions ?? 0,
  };
  if (includeQuestions) {
    payload.questions = (assessment.questions || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(publicQuestion);
  }
  return payload;
}

async function requireStudentProfile(userId) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError("Create your student profile before taking an assessment", 404);
  }
  return profile;
}

async function requireOwnedAttempt(userId, attemptId, assessmentId) {
  const profile = await requireStudentProfile(userId);
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      studentProfileId: profile.id,
      ...(assessmentId ? { assessmentId } : {}),
    },
    include: {
      assessment: true,
    },
  });
  if (!attempt) {
    throw new AppError("Assessment attempt not found", 404);
  }
  return { profile, attempt };
}

function intelligenceFromSkillRows(rows) {
  const skillResults = rows.map((row) => ({
    skillId: row.skillId,
    skillName: row.skill.name,
    correctCount: row.correctCount,
    questionCount: row.questionCount,
    pointsEarned: row.pointsEarned,
    pointsAvailable: row.pointsAvailable,
    percentage: row.percentage,
    calculatedProficiency: row.calculatedProficiency,
  }));
  return classifySkillResults(skillResults);
}

export async function listAssessments() {
  const assessments = await prisma.assessment.findMany({
    where: { isActive: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { title: "asc" },
  });
  return assessments.map((item) => publicAssessment(item));
}

export async function getAssessmentForStudent(assessmentId) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, isActive: true },
    include: {
      questions: { include: { skill: true } },
    },
  });
  if (!assessment) {
    throw new AppError("Assessment not found", 404);
  }
  return publicAssessment(assessment, { includeQuestions: true });
}

export async function startAssessment(userId, assessmentId) {
  const profile = await requireStudentProfile(userId);
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, isActive: true },
    include: { _count: { select: { questions: true } } },
  });
  if (!assessment) {
    throw new AppError("Assessment not found", 404);
  }

  const existing = await prisma.assessmentAttempt.findFirst({
    where: {
      assessmentId,
      studentProfileId: profile.id,
      status: "IN_PROGRESS",
    },
  });

  if (existing) {
    return {
      resumed: true,
      attempt: {
        id: existing.id,
        status: existing.status,
        startedAt: existing.startedAt,
      },
      assessment: publicAssessment(assessment),
    };
  }

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      assessmentId,
      studentProfileId: profile.id,
    },
  });

  return {
    resumed: false,
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
    },
    assessment: publicAssessment(assessment),
  };
}

export async function submitAssessment(userId, assessmentId, body) {
  const questions = await prisma.assessmentQuestion.findMany({
    where: { assessmentId },
    include: { skill: true },
    orderBy: { sortOrder: "asc" },
  });
  if (questions.length === 0) {
    throw new AppError("Assessment not found", 404);
  }

  const input = validateSubmitPayload(body, questions.length);
  const { attempt } = await requireOwnedAttempt(userId, input.attemptId, assessmentId);

  if (attempt.status === "SUBMITTED") {
    throw new AppError("This attempt has already been submitted", 409);
  }

  const questionMap = new Map(questions.map((item) => [item.id, item]));
  for (const answer of input.answers) {
    if (!questionMap.has(answer.questionId)) {
      throw new AppError("One or more answers do not belong to this assessment", 400);
    }
  }

  const scored = new Map();
  let earned = 0;
  let available = 0;
  const answerRows = [];

  for (const question of questions) {
    available += question.points;
    const submitted = input.answers.find((item) => item.questionId === question.id);
    const isCorrect = submitted.selectedIndex === question.correctIndex;
    const pointsEarned = isCorrect ? question.points : 0;
    earned += pointsEarned;
    scored.set(question.id, { isCorrect, pointsEarned });
    answerRows.push({
      attemptId: attempt.id,
      questionId: question.id,
      selectedIndex: submitted.selectedIndex,
      isCorrect,
      pointsEarned,
    });
  }

  const percentage = percentageFromPoints(earned, available);
  const skillRows = buildSkillResults(questions, scored);

  await prisma.$transaction(async (tx) => {
    await tx.assessmentAnswer.createMany({ data: answerRows });
    await tx.skillAssessmentResult.createMany({
      data: skillRows.map((item) => ({
        attemptId: attempt.id,
        skillId: item.skillId,
        correctCount: item.correctCount,
        questionCount: item.questionCount,
        pointsEarned: item.pointsEarned,
        pointsAvailable: item.pointsAvailable,
        percentage: item.percentage,
        calculatedProficiency: item.calculatedProficiency,
      })),
    });
    await tx.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        score: earned,
        totalPoints: available,
        percentage,
        submittedAt: new Date(),
      },
    });

    for (const item of skillRows) {
      await tx.studentSkill.upsert({
        where: {
          studentProfileId_skillId: {
            studentProfileId: attempt.studentProfileId,
            skillId: item.skillId,
          },
        },
        update: { proficiency: item.calculatedProficiency },
        create: {
          studentProfileId: attempt.studentProfileId,
          skillId: item.skillId,
          proficiency: item.calculatedProficiency,
        },
      });
    }
  });

  const intelligence = classifySkillResults(skillRows);
  return {
    attemptId: attempt.id,
    assessmentTitle: attempt.assessment.title,
    score: earned,
    totalPoints: available,
    percentage,
    ...intelligence,
  };
}

export async function getAttemptResult(userId, attemptId) {
  const { attempt } = await requireOwnedAttempt(userId, attemptId);
  if (attempt.status !== "SUBMITTED") {
    throw new AppError("This attempt has not been submitted yet", 409);
  }

  const [skillRows, answers] = await Promise.all([
    prisma.skillAssessmentResult.findMany({
      where: { attemptId },
      include: { skill: true },
    }),
    prisma.assessmentAnswer.findMany({
      where: { attemptId },
      include: {
        question: { include: { skill: true } },
      },
      orderBy: { question: { sortOrder: "asc" } },
    }),
  ]);

  const intelligence = intelligenceFromSkillRows(skillRows);
  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      assessmentTitle: attempt.assessment.title,
    },
    answers: answers.map((item) => ({
      questionId: item.questionId,
      questionText: item.question.questionText,
      skillName: item.question.skill.name,
      selectedIndex: item.selectedIndex,
      isCorrect: item.isCorrect,
      pointsEarned: item.pointsEarned,
    })),
    ...intelligence,
  };
}

export async function listAttemptHistory(userId) {
  const profile = await requireStudentProfile(userId);
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { studentProfileId: profile.id },
    include: { assessment: true },
    orderBy: { startedAt: "desc" },
  });
  return attempts.map((item) => ({
    id: item.id,
    assessmentId: item.assessmentId,
    assessmentTitle: item.assessment.title,
    status: item.status,
    percentage: item.percentage,
    startedAt: item.startedAt,
    submittedAt: item.submittedAt,
  }));
}

export async function getSkillIntelligence(userId) {
  const profile = await requireStudentProfile(userId);
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      studentProfileId: profile.id,
      status: "SUBMITTED",
    },
    include: {
      assessment: true,
      skillResults: { include: { skill: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  if (attempts.length === 0) {
    return { exists: false };
  }

  const latestBySkill = new Map();
  for (const attempt of attempts) {
    for (const row of attempt.skillResults) {
      if (!latestBySkill.has(row.skillId)) {
        latestBySkill.set(row.skillId, row);
      }
    }
  }

  const intelligence = intelligenceFromSkillRows([...latestBySkill.values()]);
  const latest = attempts[0];
  return {
    exists: true,
    latestAssessment: {
      attemptId: latest.id,
      title: latest.assessment.title,
      percentage: latest.percentage,
      submittedAt: latest.submittedAt,
    },
    ...intelligence,
  };
}
