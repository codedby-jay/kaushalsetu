import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getSkillIntelligence } from "../../services/api.js";

function Bar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-sm bg-background">
      <div className="h-full bg-primary" style={{ width: `${Math.min(100, value * 10)}%` }} />
    </div>
  );
}

export function SkillIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getSkillIntelligence();
        setData(result.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load Skill Intelligence."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Skill Intelligence</h1>
        <p className="mt-1 text-sm text-secondary">
          Built from your latest submitted assessment result for each skill.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading Skill Intelligence…</p>
        ) : error ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
            <Link to="/app/profile" className="mt-4 inline-block">
              <Button variant="secondary">Check profile</Button>
            </Link>
          </Card>
        ) : !data?.exists ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Complete your first skill assessment to generate your Skill Intelligence profile."
              description="Answers are scored against mapped skills. Readiness is the average of those skill scores."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/app/career-roadmap">
                    <Button>Career Roadmap</Button>
                  </Link>
                  <Link to="/app/assessments">
                    <Button variant="secondary">Take Assessment</Button>
                  </Link>
                </div>
              }
            />
          </Card>
        ) : (
          <>
            <Card className="mt-6 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Industry Readiness
              </p>
              <p className="mt-1 text-3xl font-semibold text-primary">{data.overallScore}%</p>
              <p className="mt-2 text-sm text-secondary">
                Average of latest assessed skill percentages. Latest assessment:{" "}
                {data.latestAssessment.title} ({data.latestAssessment.percentage}%).
              </p>
            </Card>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Strengths (≥ 7/10)</h2>
                {data.strengths.length === 0 ? (
                  <p className="mt-2 text-sm text-secondary">None yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.strengths.map((item) => (
                      <li key={item.skillId}>
                        {item.skill} — {item.proficiency}/10
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Developing (4–6/10)</h2>
                {data.developing.length === 0 ? (
                  <p className="mt-2 text-sm text-secondary">None.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.developing.map((item) => (
                      <li key={item.skillId}>
                        {item.skill} — {item.proficiency}/10
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Skill gaps (≤ 3/10)</h2>
              {data.skillGaps.length === 0 ? (
                <p className="mt-2 text-sm text-secondary">No severe gaps recorded.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {data.skillGaps.map((item) => (
                    <li key={item.skillId}>
                      {item.skill} — {item.proficiency}/10 (target {item.target}, gap {item.gap})
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Skill breakdown</h2>
              <ul className="mt-3 space-y-3">
                {data.skillResults.map((item) => (
                  <li key={item.skillId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{item.skillName}</span>
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
                <p className="mt-2 text-sm text-secondary">Keep practising across the board.</p>
              ) : (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                  {data.recommendedFocus.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ol>
              )}
            </Card>

            <div className="mt-6">
              <Link to={`/app/assessments/results/${data.latestAssessment.attemptId}`}>
                <Button variant="secondary">Open latest result</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
