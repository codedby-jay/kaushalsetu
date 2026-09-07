import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getCompanyProfile,
  getIndustryOpportunities,
} from "../../services/api.js";
import {
  formatOpportunityDate,
  statusBadgeVariant,
  typeLabel,
} from "../../utils/opportunity.js";

export function IndustryCandidatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasCompany, setHasCompany] = useState(true);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const company = await getCompanyProfile();
        if (!cancelled) {
          setHasCompany(company.data.exists);
        }
        if (!company.data.exists) {
          if (!cancelled) {
            setOpportunities([]);
          }
          return;
        }
        const result = await getIndustryOpportunities();
        if (!cancelled) {
          setOpportunities(result.data.opportunities);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to load opportunities."));
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
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Industry</p>
        <h1 className="mt-1 text-xl font-semibold text-text">Candidates</h1>
        <p className="mt-1 text-sm text-secondary">
          Review ranked applicants for your company’s opportunities. Candidates are students who
          applied to your listings — this is not a global student directory.
        </p>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading opportunities…</p>
        ) : !hasCompany ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create a company profile first"
              description="Candidate ranking is available only for opportunities owned by your company."
              action={
                <Link to="/app/company-profile">
                  <Button>Company profile</Button>
                </Link>
              }
            />
          </Card>
        ) : opportunities.length === 0 ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="No opportunities yet"
              description="Publish a role to start receiving applications you can rank by skill fit."
              action={
                <Link to="/app/opportunities/create">
                  <Button>Create opportunity</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <Card className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applicants</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-text">{item.title}</td>
                    <td className="px-4 py-3 text-secondary">{typeLabel(item.type)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-secondary">
                      {item.applicationCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {formatOpportunityDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/app/opportunities/${item.id}/applications`}>
                        <Button size="sm" variant="secondary">
                          Ranked candidates
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
