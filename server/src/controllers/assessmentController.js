import {
  getAssessmentForStudent,
  getAttemptResult,
  getSkillIntelligence,
  listAssessments,
  listAttemptHistory,
  startAssessment,
  submitAssessment,
} from "../services/assessmentService.js";

export async function list(req, res, next) {
  try {
    const assessments = await listAssessments();
    res.status(200).json({ success: true, data: { assessments } });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const assessment = await getAssessmentForStudent(req.params.id);
    res.status(200).json({ success: true, data: { assessment } });
  } catch (error) {
    next(error);
  }
}

export async function start(req, res, next) {
  try {
    const data = await startAssessment(req.user.userId, req.params.id);
    res.status(data.resumed ? 200 : 201).json({
      success: true,
      message: data.resumed ? "Continuing in-progress attempt" : "Assessment started",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function submit(req, res, next) {
  try {
    const data = await submitAssessment(req.user.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Assessment submitted",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function history(req, res, next) {
  try {
    const attempts = await listAttemptHistory(req.user.userId);
    res.status(200).json({ success: true, data: { attempts } });
  } catch (error) {
    next(error);
  }
}

export async function result(req, res, next) {
  try {
    const data = await getAttemptResult(req.user.userId, req.params.attemptId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function intelligence(req, res, next) {
  try {
    const data = await getSkillIntelligence(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
