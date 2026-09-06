import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getAssessmentHistory,
  getAssessments,
  getStudentProfile,
} from "../../services/api.js";

export function StudentAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profile = await getStudentProfile();
        setHasProfile(profile.data.exists);
        if (!profile.data.exists) {
          return;
        }
        const [list, history] = await Promise.all([
          getAssessments(),
          getAssessmentHistory(),
        ]);
        setAssessments(list.data.assessments);
        setAttempts(history.data.attempts);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load assessments."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Skill Assessment</h1>
        <p className="mt-1 text-sm text-secondary">
          Complete an assessment to generate an evidence-based Skill Intelligence
          profile.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading assessments…</p>
        ) : error ? (
          <p className="mt-8 text-sm text-danger">{error}</p>
        ) : !hasProfile ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create a profile first"
              description="Assessments are linked to your student profile."
              action={
                <Link to="/app/profile">
                  <Button>Create Profile</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-3">
              {assessments.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-[15px] font-semibold text-text">{item.title}</h2>
                      <p className="mt-1 text-sm text-secondary">{item.description}</p>
                      <p className="mt-2 text-xs text-secondary">
                        {item.questionCount} multiple-choice questions
                      </p>
                    </div>
                    <Link to={`/app/assessments/${item.id}`}>
                      <Button>Open</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <h2 className="mt-8 text-sm font-semibold text-text">Attempt history</h2>
            {attempts.length === 0 ? (
              <p className="mt-2 text-sm text-secondary">No attempts yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {attempts.map((item) => (
                  <li key={item.id}>
                    <Card className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-medium text-text">
                          {item.assessmentTitle}
                        </p>
                        <p className="text-xs text-secondary">
                          {item.status === "SUBMITTED"
                            ? `Submitted · ${item.percentage}%`
                            : "In progress"}
                        </p>
                      </div>
                      {item.status === "SUBMITTED" ? (
                        <Link to={`/app/assessments/results/${item.id}`}>
                          <Button size="sm" variant="secondary">
                            View result
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/app/assessments/${item.assessmentId}`}>
                          <Badge variant="primary">Continue</Badge>
                        </Link>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
