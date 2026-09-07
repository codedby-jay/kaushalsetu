import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getStudentApplications } from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
} from "../../utils/application.js";
import { formatOpportunityDate } from "../../utils/opportunity.js";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export function StudentApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [applied, setApplied] = useState({ search: "", status: "" });

  async function load(nextFilters = applied) {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (nextFilters.search) {
        params.search = nextFilters.search;
      }
      if (nextFilters.status) {
        params.status = nextFilters.status;
      }
      const result = await getStudentApplications(params);
      setApplications(result.data.applications);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load applications."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setApplied(filters);
    load(filters);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Student</p>
        <h1 className="mt-1 text-xl font-semibold text-text">Applications</h1>
        <p className="mt-1 text-sm text-secondary">
          Track applications you have submitted. Status is updated by the company.
        </p>

        <Card className="mt-6 p-4">
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
            <Input
              id="search"
              label="Search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Role or company"
            />
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-text">
                Status
              </label>
              <select
                id="status"
                className={selectClass}
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="">All statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Apply filters</Button>
            </div>
          </form>
        </Card>

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
              description="Browse published opportunities and apply when the skill match looks right."
              action={
                <Link to="/app/opportunities">
                  <Button>Browse opportunities</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {applications.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text">
                      {item.opportunity?.title}
                    </h2>
                    <p className="mt-1 text-sm text-secondary">
                      {item.opportunity?.company?.companyName}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      Applied {formatOpportunityDate(item.appliedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={applicationStatusVariant(item.status)}>
                      {applicationStatusLabel(item.status)}
                    </Badge>
                    {item.match?.available ? <MatchScore match={item.match} /> : null}
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={`/app/applications/${item.id}`}>
                    <Button size="sm">View application</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
