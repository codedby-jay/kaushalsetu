import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  closeIndustryOpportunity,
  deleteIndustryOpportunity,
  getApiErrorMessage,
  getCompanyProfile,
  getIndustryOpportunities,
  publishIndustryOpportunity,
  unpublishIndustryOpportunity,
} from "../../services/api.js";
import {
  formatOpportunityDate,
  statusBadgeVariant,
  typeLabel,
  workModeLabel,
} from "../../utils/opportunity.js";

export function IndustryOpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasCompany, setHasCompany] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const company = await getCompanyProfile();
      setHasCompany(company.data.exists);
      if (!company.data.exists) {
        setOpportunities([]);
        return;
      }
      const result = await getIndustryOpportunities();
      setOpportunities(result.data.opportunities);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load opportunities."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runAction(id, fn, success) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await fn(id);
      setNotice(success);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update opportunity."));
    } finally {
      setBusyId("");
    }
  }

  function handleDelete(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) {
      return;
    }
    runAction(item.id, deleteIndustryOpportunity, "Opportunity deleted.");
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Industry
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text">My Opportunities</h1>
            <p className="mt-1 text-sm text-secondary">
              Save drafts, publish listings, and close roles that are no longer open.
            </p>
          </div>
          {hasCompany ? (
            <Link to="/app/opportunities/create">
              <Button>Create opportunity</Button>
            </Link>
          ) : null}
        </div>

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
          <p className="mt-8 text-sm text-secondary">Loading opportunities…</p>
        ) : !hasCompany ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create a company profile first"
              description="Opportunities are owned by your company profile, not by a client-supplied identifier."
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
              description="Create a draft, add required skills and proficiency, then publish when ready."
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
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Work mode</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Required skills</th>
                  <th className="px-4 py-3 font-medium">Applications</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
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
                    <td className="px-4 py-3 text-secondary">{item.location}</td>
                    <td className="px-4 py-3 text-secondary">{workModeLabel(item.workMode)}</td>
                    <td className="px-4 py-3 text-secondary">
                      {formatOpportunityDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {item.skills.map((skill) => (
                          <Badge key={skill.skillId} variant="primary">
                            {skill.name} {skill.requiredProficiency}/10
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{item.applicationCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Link to={`/app/opportunities/${item.id}`}>
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                        <Link to={`/app/opportunities/${item.id}/applications`}>
                          <Button size="sm" variant="secondary">
                            Applications
                          </Button>
                        </Link>
                        {item.status !== "CLOSED" ? (
                          <Link to={`/app/opportunities/${item.id}/edit`}>
                            <Button size="sm" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                        ) : null}
                        {item.status === "DRAFT" ? (
                          <Button
                            size="sm"
                            disabled={busyId === item.id}
                            onClick={() =>
                              runAction(item.id, publishIndustryOpportunity, "Published.")
                            }
                          >
                            Publish
                          </Button>
                        ) : null}
                        {item.status === "PUBLISHED" ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busyId === item.id}
                              onClick={() =>
                                runAction(item.id, unpublishIndustryOpportunity, "Unpublished.")
                              }
                            >
                              Unpublish
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busyId === item.id}
                              onClick={() =>
                                runAction(item.id, closeIndustryOpportunity, "Closed.")
                              }
                            >
                              Close
                            </Button>
                          </>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === item.id}
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </Button>
                      </div>
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
