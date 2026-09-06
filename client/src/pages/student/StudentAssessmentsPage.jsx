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
  getCareerRoadmap,
  getStudentProfile,
} from "../../services/api.js";

export function StudentAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [goalName, setGoalName] = useState("");

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
        const [list, history, roadmap] = await Promise.all([
          getAssessments(),
          getAssessmentHistory(),
          getCareerRoadmap().catch(() => null),
        ]);
        setAssessments(list.data.assessments);
        setAttempts(history.data.attempts);
        if (roadmap?.data?.exists) {
          setRecommended(roadmap.data.recommendedAssessments || []);
          setGoalName(roadmap.data.role?.name || "");
        } else {
          setRecommended([]);
          setGoalName("");
        }
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
          Recommended assessments follow your career goal. The full catalog remains
          available below.
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
            {recommended.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-text">
                  Recommended for your career goal
                  {goalName ? ` · ${goalName}` : ""}
                </h2>
                <p className="mt-1 text-xs text-secondary">
                  Ranked by skill gap and how focused each paper is on the unmet skill.
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {recommended.map((item) => (
                    <Card key={item.assessmentId} className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-[15px] font-semibold text-text">{item.title}</h3>
                          <p className="mt-1 text-sm text-secondary">
                            {item.forSkill.skillName}: {item.forSkill.currentProficiency}/
                            {item.forSkill.requiredProficiency} (gap {item.forSkill.gap})
                          </p>
                        </div>
                        <Link to={`/app/assessments/${item.assessmentId}`}>
                          <Button>Open</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-secondary">
                <Link to="/app/career-roadmap" className="font-medium text-primary">
                  Set a career goal
                </Link>{" "}
                to see recommended assessments for unmet skills.
              </p>
            )}

            <h2 className="mt-8 text-sm font-semibold text-text">All assessments</h2>
            <div className="mt-3 flex flex-col gap-3">
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
