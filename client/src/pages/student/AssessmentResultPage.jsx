import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getAssessmentResult } from "../../services/api.js";

function Bar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-sm bg-background">
      <div className="h-full bg-primary" style={{ width: `${Math.min(100, value * 10)}%` }} />
    </div>
  );
}

export function AssessmentResultPage() {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getAssessmentResult(attemptId);
        setData(result.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load this result."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Skill Intelligence
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-secondary">Loading result…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-danger">{error}</p>
        ) : (
          <>
            <h1 className="mt-1 text-xl font-semibold text-text">
              {data.attempt.assessmentTitle}
            </h1>
            <p className="mt-1 text-sm text-secondary">
              Score {data.attempt.score}/{data.attempt.totalPoints} · Proficiency on My
              Skills was updated from this attempt.
            </p>

            <Card className="mt-6 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Industry Readiness
              </p>
              <p className="mt-1 text-3xl font-semibold text-primary">{data.overallScore}%</p>
              <p className="mt-2 text-sm text-secondary">
                Average of your assessed skill scores (0–100) on this attempt. This is not
                profile completion.
              </p>
            </Card>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Strengths</h2>
                {data.strengths.length === 0 ? (
                  <p className="mt-2 text-sm text-secondary">None at 7/10 or above.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-text">
                    {data.strengths.map((item) => (
                      <li key={item.skillId}>
                        {item.skill} — {item.proficiency}/10
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Needs improvement</h2>
                {[...data.skillGaps, ...data.developing].length === 0 ? (
                  <p className="mt-2 text-sm text-secondary">No gaps on this attempt.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-text">
                    {[...data.skillGaps, ...data.developing].map((item) => (
                      <li key={item.skillId}>
                        {item.skill} — {item.proficiency}/10
                        <span className="text-secondary"> (target {item.target})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Skill breakdown</h2>
              <ul className="mt-3 space-y-3">
                {data.skillResults.map((item) => (
                  <li key={item.skillId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-text">{item.skillName}</span>
                      <span className="text-secondary">{item.calculatedProficiency}/10</span>
                    </div>
                    <Bar value={item.calculatedProficiency} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Recommended focus</h2>
              {data.recommendedFocus.length === 0 ? (
                <p className="mt-2 text-sm text-secondary">
                  No focused gaps on this attempt.
                </p>
              ) : (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-text">
                  {data.recommendedFocus.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ol>
              )}
            </Card>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/app/skill-intelligence">
                <Button>Skill Intelligence</Button>
              </Link>
              <Link to="/app/assessments">
                <Button variant="secondary">All assessments</Button>
              </Link>
              <Badge variant="primary">Readiness {data.overallScore}%</Badge>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
