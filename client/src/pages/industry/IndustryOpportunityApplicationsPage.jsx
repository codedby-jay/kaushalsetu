import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getIndustryOpportunity,
  getIndustryOpportunityApplications,
} from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
} from "../../utils/application.js";

export function IndustryOpportunityApplicationsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [opp, apps] = await Promise.all([
          getIndustryOpportunity(id),
          getIndustryOpportunityApplications(id),
        ]);
        if (!cancelled) {
          setOpportunity(opp.data.opportunity);
          setApplications(apps.data.applications);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to load applications."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <Link
          to={`/app/opportunities/${id}`}
          className="text-sm text-primary no-underline hover:underline"
        >
          Back to opportunity
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text">Applications</h1>
        <p className="mt-1 text-sm text-secondary">
          {opportunity?.title || "Opportunity"} · {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading applications…</p>
        ) : applications.length === 0 ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="No applications yet"
              description="When students apply, they will appear here with a live skill match."
            />
          </Card>
        ) : (
          <div className="mt-6 grid gap-3">
            {applications.map((item) => (
              <Link
                key={item.id}
                to={`/app/industry/applications/${item.id}`}
                className="no-underline"
              >
                <Card className="p-4 hover:bg-background">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text">{item.applicant?.name}</p>
                      <p className="text-sm text-secondary">{item.applicant?.headline || item.applicant?.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {item.match ? (
                        <MatchScore match={{ available: true, ...item.match }} />
                      ) : null}
                      <Badge variant={applicationStatusVariant(item.status)}>
                        {applicationStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
