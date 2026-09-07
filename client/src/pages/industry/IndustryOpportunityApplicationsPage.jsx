import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getIndustryOpportunity,
  getIndustryOpportunityApplications,
  updateIndustryApplicationStatus,
} from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
  industryStatusActions,
} from "../../utils/application.js";
import { formatOpportunityDate } from "../../utils/opportunity.js";
import {
  CANDIDATE_SORT_OPTIONS,
  CANDIDATE_STATUS_FILTERS,
  requiredSkillsLabel,
} from "../../utils/ranking.js";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

function buildParams(filters) {
  const params = { sort: filters.sort || "match_desc" };
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.minMatch) {
    params.minMatch = Number(filters.minMatch);
  }
  if (filters.statusChip === "all") {
    params.includeWithdrawn = true;
  } else if (filters.statusChip !== "active") {
    params.status = filters.statusChip;
  }
  return params;
}

export function IndustryOpportunityApplicationsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    sort: "match_desc",
    minMatch: "",
    statusChip: "active",
  });
  const [applied, setApplied] = useState({
    search: "",
    sort: "match_desc",
    minMatch: "",
    statusChip: "active",
  });

  async function load(nextFilters = applied) {
    setLoading(true);
    setError("");
    try {
      const [opp, apps] = await Promise.all([
        getIndustryOpportunity(id),
        getIndustryOpportunityApplications(id, buildParams(nextFilters)),
      ]);
      setOpportunity(opp.data.opportunity);
      setApplications(apps.data.applications);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load candidates."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function handleSubmit(event) {
    event.preventDefault();
    setApplied(filters);
    load(filters);
  }

  function handleStatusChip(statusChip) {
    const next = { ...filters, statusChip };
    setFilters(next);
    setApplied(next);
    load(next);
  }

  async function handleStatus(applicationId, nextStatus) {
    setBusyId(applicationId);
    setError("");
    setNotice("");
    try {
      await updateIndustryApplicationStatus(applicationId, nextStatus);
      setNotice(`Status updated to ${applicationStatusLabel(nextStatus)}.`);
      await load(applied);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update status."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/app/candidates"
          className="text-sm text-primary no-underline hover:underline"
        >
          Back to candidates
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text">Ranked candidates</h1>
        <p className="mt-1 text-sm text-secondary">
          {opportunity?.title || "Opportunity"} · skill-based ranking from the live match score,
          required-skill coverage, skill gaps, then application date.
        </p>

        <Card className="mt-6 p-4">
          <form className="grid gap-3 lg:grid-cols-4" onSubmit={handleSubmit}>
            <Input
              id="candidate-search"
              label="Search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Candidate name"
            />
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="candidate-sort" className="text-sm font-medium text-text">
                Sort
              </label>
              <select
                id="candidate-sort"
                className={selectClass}
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, sort: event.target.value }))
                }
              >
                {CANDIDATE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="min-match"
              label="Minimum match %"
              type="number"
              min="0"
              max="100"
              value={filters.minMatch}
              onChange={(event) =>
                setFilters((current) => ({ ...current, minMatch: event.target.value }))
              }
              placeholder="e.g. 70"
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Apply
              </Button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {CANDIDATE_STATUS_FILTERS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleStatusChip(chip.id)}
                className={
                  applied.statusChip === chip.id
                    ? "rounded-md border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
                    : "rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-secondary hover:bg-background"
                }
              >
                {chip.label}
              </button>
            ))}
          </div>
        </Card>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="mt-4 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
            {notice}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading candidates…</p>
        ) : applications.length === 0 ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="No candidates in this view"
              description="When students apply, they are ranked here by skill fit. Withdrawn applications are hidden from Active unless you open Withdrawn or All."
            />
          </Card>
        ) : (
          <Card className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Match</th>
                  <th className="px-4 py-3 font-medium">Required skills</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => {
                  const actions = industryStatusActions(item.status);
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 align-top">
                      <td className="px-4 py-3 font-semibold tabular-nums text-text">
                        #{item.ranking?.rank ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{item.applicant?.name}</p>
                        <p className="text-xs text-secondary">
                          {item.applicant?.headline || item.applicant?.college || item.applicant?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {item.match ? (
                          <MatchScore match={{ available: true, ...item.match }} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {requiredSkillsLabel(item.ranking)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={applicationStatusVariant(item.status)}>
                          {applicationStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {formatOpportunityDate(item.appliedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Link to={`/app/industry/applications/${item.id}`}>
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>
                          {actions.map((action) => (
                            <Button
                              key={action.status}
                              size="sm"
                              variant={action.variant}
                              disabled={busyId === item.id}
                              onClick={() => handleStatus(item.id, action.status)}
                            >
                              {busyId === item.id ? "Updating…" : action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
