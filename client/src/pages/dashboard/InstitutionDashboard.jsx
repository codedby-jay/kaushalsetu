import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import {
  DashboardSection,
  LabeledBar,
  MetricCard,
} from "../../components/dashboard/DashboardWidgets.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getInstitutionDashboard } from "../../services/api.js";
import { applicationStatusLabel } from "../../utils/application.js";

const READINESS_ORDER = [
  ["READY", "Ready"],
  ["ALMOST_READY", "Almost Ready"],
  ["DEVELOPING", "Developing"],
  ["NEEDS_ATTENTION", "Needs Attention"],
  ["INSUFFICIENT_DATA", "Insufficient Data"],
];

const PIPELINE = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];

function gapVariant(gap) {
  if (gap === "Significant") {
    return "danger";
  }
  if (gap === "Notable") {
    return "warning";
  }
  if (gap === "Aligned") {
    return "success";
  }
  return "default";
}

export function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getInstitutionDashboard();
        setDashboard(result.data.dashboard);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load analytics."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const summary = dashboard?.summary;
  const readinessTotal = dashboard
    ? Object.values(dashboard.readinessDistribution || {}).reduce((sum, n) => sum + n, 0)
    : 0;
  const pipelineMax = dashboard
    ? Math.max(1, ...PIPELINE.map((status) => dashboard.applicationPipeline[status] || 0))
    : 1;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Institution Analytics
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Platform-wide anonymized insights</h1>
        <p className="mt-1 text-sm text-secondary">
          {dashboard?.notice ||
            "Aggregated skill, demand, and placement signals across the portal. Institution-specific student tenancy is not modeled yet."}
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading analytics…</p>
        ) : error ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
          </Card>
        ) : !dashboard.hasStudentData ? (
          <Card className="mt-6">
            <EmptyState
              title="No student data available yet."
              description="Analytics appear when students create profiles, add skills, and set career goals."
            />
          </Card>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total students" value={summary.totalStudents} />
              <MetricCard
                label="Assessed students"
                value={summary.assessedStudents}
                hint={`${summary.assessmentCompletionPercent}% completion`}
              />
              <MetricCard
                label="Average industry readiness"
                value={
                  summary.averageIndustryReadiness === null
                    ? "—"
                    : `${summary.averageIndustryReadiness}%`
                }
                hint="Students with an active career goal"
              />
              <MetricCard
                label="Ready / almost ready"
                value={summary.placementReadyStudents}
                hint="Career roadmap match ≥ 60%"
              />
              <MetricCard label="Active internships" value={summary.activeInternships} />
              <MetricCard label="Applications" value={summary.applications} />
              <MetricCard label="Selected students" value={summary.selectedStudents} />
            </div>

            <DashboardSection
              title="Readiness distribution"
              description="Same bands as explainable matching: ≥80 Ready, ≥60 Almost Ready, ≥40 Developing."
            >
              {readinessTotal === 0 ? (
                <p className="text-sm text-secondary">Not enough data to chart readiness.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {READINESS_ORDER.map(([key, label]) => (
                    <LabeledBar
                      key={key}
                      label={label}
                      value={dashboard.readinessDistribution[key] || 0}
                      max={readinessTotal}
                    />
                  ))}
                </div>
              )}
            </DashboardSection>

            <div className="grid gap-5 lg:grid-cols-2">
              <DashboardSection
                title="Top student skill gaps"
                description="Share of students with a career goal who are below that role’s target proficiency. Missing skills count as 0."
              >
                {dashboard.skillGaps.length === 0 ? (
                  <p className="text-sm text-secondary">No career-goal skill gaps to report yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.skillGaps.map((item) => (
                      <LabeledBar
                        key={item.skill}
                        label={item.skill}
                        value={item.gapRatePercent}
                        suffix="%"
                      />
                    ))}
                  </div>
                )}
              </DashboardSection>

              <DashboardSection
                title="Industry skill demand"
                description="Skills listed on PUBLISHED opportunities only. Draft and closed listings are excluded."
              >
                {dashboard.industryDemand.length === 0 ? (
                  <p className="text-sm text-secondary">No published opportunity skills yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.industryDemand.map((item) => (
                      <LabeledBar
                        key={item.skill}
                        label={item.skill}
                        value={item.opportunityCount}
                        max={dashboard.industryDemand[0]?.opportunityCount || 1}
                        suffix=" opportunities"
                      />
                    ))}
                  </div>
                )}
              </DashboardSection>
            </div>

            <DashboardSection
              title="Skill gap vs industry demand"
              description="Rule-based insights, not AI. Demand uses published listings; proficiency is the average StudentSkill value (missing = 0)."
            >
              {dashboard.insights.length === 0 ? (
                <p className="text-sm text-secondary">No demand insights yet.</p>
              ) : (
                <ul className="space-y-3">
                  {dashboard.insights.map((item) => (
                    <li key={item.skill} className="rounded-md border border-border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-text">{item.skill}</p>
                        <Badge variant={gapVariant(item.gap)}>{item.gap}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-secondary">{item.summary}</p>
                      <p className="mt-2 text-sm">
                        <span className="text-secondary">Industry demand: </span>
                        {item.demandLabel}
                        <span className="text-secondary"> · Average student proficiency: </span>
                        {item.proficiencyLabel} ({item.averageStudentProficiency}/10)
                      </p>
                      <p className="mt-1 text-sm text-text">
                        Recommended action: {item.recommendedAction}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardSection>

            <DashboardSection title="Application / selection pipeline">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PIPELINE.map((status) => (
                  <LabeledBar
                    key={status}
                    label={applicationStatusLabel(status)}
                    value={dashboard.applicationPipeline[status] || 0}
                    max={pipelineMax}
                  />
                ))}
              </div>
            </DashboardSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
