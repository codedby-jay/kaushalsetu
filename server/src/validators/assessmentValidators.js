import { AppError } from "../utils/AppError.js";

export function validateSubmitPayload(body, questionCount) {
  if (!body?.attemptId || typeof body.attemptId !== "string") {
    throw new AppError("Validation failed", 400, { attemptId: "Attempt is required" });
  }

  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    throw new AppError("Validation failed", 400, { answers: "Answers are required" });
  }

  if (body.answers.length !== questionCount) {
    throw new AppError("Answer every question before submitting", 400);
  }

  const seen = new Set();
  const answers = body.answers.map((item, index) => {
    const questionId = item?.questionId;
    const selectedIndex = Number(item?.selectedIndex);

    if (!questionId || typeof questionId !== "string") {
      throw new AppError("Validation failed", 400, {
        answers: `Question id is required at position ${index + 1}`,
      });
    }
    if (seen.has(questionId)) {
      throw new AppError("Duplicate answers are not allowed", 400);
    }
    seen.add(questionId);

    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
      throw new AppError("Validation failed", 400, {
        answers: "Each answer must be an option from 0 to 3",
      });
    }

    return { questionId, selectedIndex };
  });

  return {
    attemptId: body.attemptId,
    answers,
  };
}
