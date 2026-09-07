import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ProgressBar } from "../../components/ui/ProgressBar.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import {
  CssBar,
  DashboardSection,
  MetricCard,
} from "../../components/dashboard/DashboardWidgets.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getApiErrorMessage, getStudentDashboard } from "../../services/api.js";
import { applicationStatusLabel, applicationStatusVariant } from "../../utils/application.js";
import { formatOpportunityDate } from "../../utils/opportunity.js";

function greeting(name) {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = String(name || "there").trim().split(/\s+/)[0];
  return `${prefix}, ${first}`;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getStudentDashboard();
        setDashboard(result.data.dashboard);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load dashboard."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const readiness = dashboard?.metrics?.industryReadiness;
  const readinessValue = readiness?.available ? `${readiness.percentage}%` : "—";

  const skillLists = useMemo(() => {
    const intel = dashboard?.skillIntelligence;
    if (!intel?.exists) {
      return null;
    }
    return intel;
  }, [dashboard]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">{greeting(user?.name)}</h1>
        <p className="mt-1 text-sm text-secondary">Your career readiness overview</p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading dashboard…</p>
        ) : error ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
          </Card>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            {dashboard.profileCompletion?.prompt ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning/25 bg-warning/10 px-4 py-3">
                <p className="text-sm text-text">{dashboard.profileCompletion.prompt}</p>
                <Link to="/app/profile">
                  <Button size="sm">Complete profile</Button>
                </Link>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Industry Readiness"
                value={readinessValue}
                hint={
                  readiness?.available
                    ? readiness.label
                    : "Set a career goal to see readiness"
                }
              />
              <MetricCard
                label="Skills added"
                value={dashboard.metrics.skillsAdded}
                hint={dashboard.metrics.skillsAdded ? "On your profile" : "No skills added yet"}
              />
              <MetricCard
                label="Applications"
                value={dashboard.metrics.applications}
                hint="Excluding withdrawn"
              />
              <MetricCard
                label="Recommended opportunities"
                value={dashboard.metrics.recommendedOpportunities}
                hint="Good or excellent match among recent listings"
              />
            </div>

            <DashboardSection
              title="Career goal"
              description="Readiness uses the same career roadmap calculation as Phase 7."
              action={
                <Link to="/app/career-roadmap">
                  <Button size="sm" variant="secondary">
                    {dashboard.career.exists ? "Open roadmap" : "Set career goal"}
                  </Button>
                </Link>
              }
            >
              {!dashboard.career.exists ? (
                <EmptyState
                  className="py-10"
                  title="No career goal yet."
                  description="Set a career goal to see your readiness roadmap."
                  action={
                    <Link to="/app/career-roadmap">
                      <Button>Set Career Goal</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-sm text-secondary">Career goal</p>
                    <p className="mt-0.5 text-base font-semibold text-text">
                      {dashboard.career.role?.name}
                    </p>
                    <p className="mt-3 text-sm text-secondary">Readiness</p>
                    <p className="text-2xl font-semibold text-primary">
                      {dashboard.career.readiness?.percentage}%
                    </p>
                    <p className="text-sm text-secondary">{dashboard.career.readiness?.label}</p>
                    <div className="mt-4 space-y-3">
                      {dashboard.career.skills.map((item) => (
                        <div key={item.skillId}>
                          <ProgressBar
                            label={`${item.skillName} (${item.currentProficiency}/${item.requiredProficiency})`}
                            value={
                              item.requiredProficiency
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (item.currentProficiency / item.requiredProficiency) * 100,
                                    ),
                                  )
                                : 100
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                      Recommended next assessment
                    </p>
                    {dashboard.career.recommendedAssessment ? (
                      <>
                        <p className="mt-2 font-medium text-text">
                          {dashboard.career.recommendedAssessment.title}
                        </p>
                        <p className="mt-1 text-sm text-secondary">
                          {dashboard.career.recommendedAssessment.forSkill.skillName} · current{" "}
                          {dashboard.career.recommendedAssessment.forSkill.currentProficiency}/10
                          · target{" "}
                          {dashboard.career.recommendedAssessment.forSkill.requiredProficiency}/10
                        </p>
                        <Link
                          to={`/app/assessments/${dashboard.career.recommendedAssessment.assessmentId}`}
                          className="mt-4 inline-block"
                        >
                          <Button size="sm">Take assessment</Button>
                        </Link>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-secondary">{dashboard.career.message}</p>
                    )}
                  </div>
                </div>
              )}
            </DashboardSection>

            <DashboardSection
              title="Skill Intelligence"
              description="From your latest submitted assessment for each skill."
              action={
                <Link to="/app/skill-intelligence">
                  <Button size="sm" variant="secondary">
                    View details
                  </Button>
                </Link>
              }
            >
              {!skillLists ? (
                <EmptyState
                  className="py-10"
                  title={
                    dashboard.metrics.skillsAdded
                      ? "No Skill Intelligence yet."
                      : "No skills added yet."
                  }
                  description={
                    dashboard.metrics.skillsAdded
                      ? "Complete an assessment to generate Skill Intelligence."
                      : "Add your skills to unlock skill intelligence."
                  }
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link to="/app/skills">
                        <Button>Add Skills</Button>
                      </Link>
                      <Link to="/app/assessments">
                        <Button variant="secondary">Take Assessment</Button>
                      </Link>
                    </div>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-text">Strong skills</h3>
                    <SkillNameList items={skillLists.strengths} empty="None yet." />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text">Developing</h3>
                    <SkillNameList items={skillLists.developing} empty="None." />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text">Skill gaps</h3>
                    <SkillNameList items={skillLists.skillGaps} empty="No severe gaps." />
                  </div>
                </div>
              )}
            </DashboardSection>

            <DashboardSection
              title="Recommended opportunities"
              description="Explainable match from the existing matching engine. Published listings only."
              action={
                <Link to="/app/opportunities">
                  <Button size="sm" variant="secondary">
                    Browse all
                  </Button>
                </Link>
              }
            >
              {dashboard.metrics.skillsAdded === 0 ? (
                <EmptyState
                  className="py-10"
                  title="No skills added yet."
                  description="Add your skills to unlock opportunity matching."
                  action={
                    <Link to="/app/skills">
                      <Button>Add Skills</Button>
                    </Link>
                  }
                />
              ) : dashboard.recommendedOpportunities.length === 0 ? (
                <p className="text-sm text-secondary">No published opportunities to match yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {dashboard.recommendedOpportunities.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-text">{item.title}</p>
                        <p className="text-sm text-secondary">{item.companyName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MatchScore match={item.match} />
                        <Link to={`/app/opportunities/${item.id}`}>
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardSection>

            <DashboardSection
              title="Recent applications"
              action={
                <Link to="/app/applications">
                  <Button size="sm" variant="secondary">
                    View all
                  </Button>
                </Link>
              }
            >
              {dashboard.recentApplications.length === 0 ? (
                <EmptyState
                  className="py-10"
                  title="No applications yet."
                  description="You haven't applied to an opportunity yet."
                  action={
                    <Link to="/app/opportunities">
                      <Button>Explore Opportunities</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-secondary">
                      <tr>
                        <th className="pb-2 font-medium">Opportunity</th>
                        <th className="pb-2 font-medium">Company</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentApplications.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="py-2.5">
                            <Link
                              to={`/app/applications/${item.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {item.opportunity?.title}
                            </Link>
                          </td>
                          <td className="py-2.5 text-secondary">
                            {item.opportunity?.company?.companyName}
                          </td>
                          <td className="py-2.5">
                            <Badge variant={applicationStatusVariant(item.status)}>
                              {applicationStatusLabel(item.status)}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-secondary">
                            {formatOpportunityDate(item.appliedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function SkillNameList({ items, empty }) {
  if (!items?.length) {
    return <p className="mt-2 text-sm text-secondary">{empty}</p>;
  }
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li key={item.skillId} className="text-sm">
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-text">{item.skill}</span>
            <span className="text-secondary">{item.proficiency}/10</span>
          </div>
          <CssBar value={item.proficiency} max={10} />
        </li>
      ))}
    </ul>
  );
}
