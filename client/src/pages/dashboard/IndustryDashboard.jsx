import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import {
  DashboardSection,
  LabeledBar,
  MetricCard,
} from "../../components/dashboard/DashboardWidgets.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getIndustryDashboard } from "../../services/api.js";
import { applicationStatusLabel, applicationStatusVariant } from "../../utils/application.js";
import { formatOpportunityDate, statusBadgeVariant } from "../../utils/opportunity.js";

const PIPELINE = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];

export function IndustryDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getIndustryDashboard();
        setDashboard(result.data.dashboard);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load dashboard."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Industry workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">
          {dashboard?.company?.companyName || "Company dashboard"}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Opportunities, applicants, and candidate ranking for your company only.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading dashboard…</p>
        ) : error ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
          </Card>
        ) : !dashboard.exists ? (
          <Card className="mt-6">
            <EmptyState
              title="No company profile yet."
              description="Create a company profile to post opportunities and review candidates."
              action={
                <Link to="/app/company-profile">
                  <Button>Create Company Profile</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Open opportunities" value={dashboard.metrics.openOpportunities} />
              <MetricCard label="Applications" value={dashboard.metrics.applications} />
              <MetricCard label="Shortlisted" value={dashboard.metrics.shortlisted} />
              <MetricCard label="Selected" value={dashboard.metrics.selected} />
            </div>

            <DashboardSection
              title="Opportunity overview"
              action={
                <Link to="/app/opportunities/manage">
                  <Button size="sm" variant="secondary">
                    Manage
                  </Button>
                </Link>
              }
            >
              {dashboard.opportunities.length === 0 ? (
                <EmptyState
                  className="py-10"
                  title="No opportunities yet."
                  description="Create an opportunity to start receiving applications."
                  action={
                    <Link to="/app/opportunities/create">
                      <Button>Create Opportunity</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-secondary">
                      <tr>
                        <th className="pb-2 font-medium">Opportunity</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Applicants</th>
                        <th className="pb-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.opportunities.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="py-2.5 font-medium text-text">{item.title}</td>
                          <td className="py-2.5">
                            <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                          </td>
                          <td className="py-2.5 tabular-nums">{item.applicationCount}</td>
                          <td className="py-2.5 text-right">
                            <Link to={`/app/opportunities/${item.id}/applications`}>
                              <Button size="sm" variant="secondary">
                                View Candidates
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardSection>

            <DashboardSection title="Candidate pipeline">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PIPELINE.map((status) => (
                  <LabeledBar
                    key={status}
                    label={applicationStatusLabel(status)}
                    value={dashboard.pipeline[status] || 0}
                    max={Math.max(dashboard.metrics.applications, 1)}
                  />
                ))}
              </div>
            </DashboardSection>

            <DashboardSection title="Recent applications">
              {dashboard.recentApplications.length === 0 ? (
                <p className="text-sm text-secondary">No applications on your listings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-secondary">
                      <tr>
                        <th className="pb-2 font-medium">Candidate</th>
                        <th className="pb-2 font-medium">Opportunity</th>
                        <th className="pb-2 font-medium">Match</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentApplications.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="py-2.5">
                            <Link
                              to={`/app/industry/applications/${item.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {item.candidateName}
                            </Link>
                          </td>
                          <td className="py-2.5 text-secondary">{item.opportunityTitle}</td>
                          <td className="py-2.5 tabular-nums">{item.matchPercentage}%</td>
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

            <DashboardSection
              title="Top candidates"
              description="Ranked with the same Phase 9 fit order: match, required-skill coverage, then total skill gap."
              action={
                <Link to="/app/candidates">
                  <Button size="sm" variant="secondary">
                    All candidates
                  </Button>
                </Link>
              }
            >
              {dashboard.topCandidates.length === 0 ? (
                <p className="text-sm text-secondary">No ranked candidates yet.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {dashboard.topCandidates.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-text">
                          #{item.rank} {item.candidateName}
                        </p>
                        <p className="text-sm text-secondary">{item.opportunityTitle}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="tabular-nums font-medium">{item.matchPercentage}%</span>
                        <Badge variant="primary">{item.label}</Badge>
                        <Link to={`/app/industry/applications/${item.id}`}>
                          <Button size="sm" variant="secondary">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </DashboardSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
