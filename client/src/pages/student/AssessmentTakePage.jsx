import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { ProgressBar } from "../../components/ui/ProgressBar.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getAssessment,
  startAssessment,
  submitAssessment,
} from "../../services/api.js";

export function AssessmentTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const questions = assessment?.questions || [];
  const current = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((item) => answers[item.id] !== undefined).length,
    [answers, questions],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getAssessment(id);
        setAssessment(result.data.assessment);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load this assessment."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStart() {
    setError("");
    try {
      const result = await startAssessment(id);
      setAttemptId(result.data.attempt.id);
      setIndex(0);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to start the assessment."));
    }
  }

  async function handleSubmit() {
    if (answeredCount !== questions.length) {
      setError("Answer every question before submitting.");
      return;
    }
    if (!window.confirm("Submit this assessment? You cannot change answers afterwards.")) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        attemptId,
        answers: questions.map((item) => ({
          questionId: item.id,
          selectedIndex: answers[item.id],
        })),
      };
      const result = await submitAssessment(id, payload);
      navigate(`/app/assessments/results/${result.data.attemptId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to submit the assessment."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <p className="text-sm text-secondary">Loading assessment…</p>
        ) : error && !assessment ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Skill Assessment
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text">{assessment.title}</h1>
            <p className="mt-1 text-sm text-secondary">{assessment.description}</p>

            {!attemptId ? (
              <Card className="mt-6 p-5">
                <p className="text-sm text-secondary">
                  {assessment.questions.length} questions. Correct answers are scored on
                  the server. Your Skill Intelligence is updated after submit.
                </p>
                {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
                <div className="mt-4 flex gap-3">
                  <Button onClick={handleStart}>Start assessment</Button>
                  <Link to="/app/assessments">
                    <Button variant="secondary">Back</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <>
                <div className="mt-6">
                  <ProgressBar
                    value={Math.round((answeredCount / questions.length) * 100)}
                    label={`Question ${index + 1} of ${questions.length} · ${answeredCount} answered`}
                  />
                </div>
                <Card className="mt-4 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                    {current.skillName} · {current.difficulty}
                  </p>
                  <h2 className="mt-2 text-[15px] font-semibold text-text">
                    {current.questionText}
                  </h2>
                  <fieldset className="mt-4 flex flex-col gap-2">
                    <legend className="sr-only">Options</legend>
                    {current.options.map((option, optionIndex) => {
                      const selected = answers[current.id] === optionIndex;
                      return (
                        <label
                          key={optionIndex}
                          className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm ${
                            selected
                              ? "border-primary bg-primary/8 text-text"
                              : "border-border text-text hover:bg-background"
                          }`}
                        >
                          <input
                            type="radio"
                            className="mt-0.5"
                            name={current.id}
                            checked={selected}
                            onChange={() =>
                              setAnswers((value) => ({
                                ...value,
                                [current.id]: optionIndex,
                              }))
                            }
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                </Card>

                {error ? (
                  <p className="mt-3 text-sm text-danger" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="secondary"
                    disabled={index === 0}
                    onClick={() => setIndex((value) => value - 1)}
                  >
                    Previous
                  </Button>
                  <p className="text-xs text-secondary">
                    {questions.map((item) => (answers[item.id] === undefined ? "○" : "●")).join(" ")}
                  </p>
                  {index < questions.length - 1 ? (
                    <Button onClick={() => setIndex((value) => value + 1)}>Next</Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
