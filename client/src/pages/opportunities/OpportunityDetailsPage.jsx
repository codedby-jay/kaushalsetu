import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getApiErrorMessage,
  getIndustryOpportunity,
  getPublishedOpportunity,
} from "../../services/api.js";
import {
  compensationText,
  formatOpportunityDate,
  statusBadgeVariant,
  typeLabel,
  workModeLabel,
} from "../../utils/opportunity.js";

export function OpportunityDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isIndustry = user?.role === "INDUSTRY";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opportunity, setOpportunity] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = isIndustry
          ? await getIndustryOpportunity(id)
          : await getPublishedOpportunity(id);
        if (!cancelled) {
          setOpportunity(result.data.opportunity);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to load this opportunity."));
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
  }, [id, isIndustry]);

  const backTo = isIndustry ? "/app/opportunities/manage" : "/app/opportunities";

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <Link to={backTo} className="text-sm text-primary no-underline hover:underline">
          Back to opportunities
        </Link>
        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading opportunity…</p>
        ) : error ? (
          <p className="mt-6 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {opportunity.company?.companyName}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-text">{opportunity.title}</h1>
                <p className="mt-1 text-sm text-secondary">
                  {opportunity.location} · {workModeLabel(opportunity.workMode)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{typeLabel(opportunity.type)}</Badge>
                {isIndustry && opportunity.status ? (
                  <Badge variant={statusBadgeVariant(opportunity.status)}>
                    {opportunity.status}
                  </Badge>
                ) : null}
              </div>
            </div>

            {isIndustry && opportunity.status && opportunity.status !== "CLOSED" ? (
              <div className="mt-4">
                <Link to={`/app/opportunities/${opportunity.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
              </div>
            ) : null}

            <Card className="mt-6 p-5">
              <h2 className="text-sm font-semibold text-text">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">
                {opportunity.description}
              </p>
            </Card>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Role details</h2>
                <dl className="mt-3 grid gap-2 text-sm">
                  <Row label="Duration" value={opportunity.duration || "—"} />
                  <Row label="Compensation" value={compensationText(opportunity)} />
                  <Row
                    label="Application deadline"
                    value={formatOpportunityDate(opportunity.applicationDeadline)}
                  />
                </dl>
              </Card>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Company</h2>
                <dl className="mt-3 grid gap-2 text-sm">
                  <Row label="Industry" value={opportunity.company?.industry || "—"} />
                  <Row label="Location" value={opportunity.company?.location || "—"} />
                  <Row label="Website" value={opportunity.company?.website || "—"} />
                </dl>
              </Card>
            </div>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Required skills</h2>
              <p className="mt-1 text-xs text-secondary">
                Proficiency is required on a 0–10 scale. Matching is not calculated yet.
              </p>
              <ul className="mt-3 grid gap-2">
                {opportunity.skills.map((skill) => (
                  <li
                    key={skill.skillId}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-text">{skill.name}</span>
                    <span className="text-secondary">
                      {skill.requiredProficiency}/10 · {skill.isRequired ? "Required" : "Optional"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {!isIndustry ? (
              <Card className="mt-4 p-5">
                <p className="text-sm text-secondary">
                  Application functionality coming soon.
                </p>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-secondary">{label}</dt>
      <dd className="text-right text-text">{value}</dd>
    </div>
  );
}
