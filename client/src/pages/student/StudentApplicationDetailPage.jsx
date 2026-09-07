import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { MatchScore, SkillMatchRow } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getStudentApplication,
  withdrawStudentApplication,
} from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
  canWithdraw,
} from "../../utils/application.js";
import { formatOpportunityDate } from "../../utils/opportunity.js";

export function StudentApplicationDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [application, setApplication] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getStudentApplication(id);
      setApplication(result.data.application);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load this application."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleWithdraw() {
    if (!window.confirm("Withdraw this application? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await withdrawStudentApplication(id);
      setApplication(result.data.application);
      setNotice("Application withdrawn.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to withdraw application."));
    } finally {
      setBusy(false);
    }
  }

  const match = application?.match;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <Link to="/app/applications" className="text-sm text-primary no-underline hover:underline">
          Back to applications
        </Link>
        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading application…</p>
        ) : error && !application ? (
          <p className="mt-6 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {application.opportunity?.company?.companyName}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-text">
                  {application.opportunity?.title}
                </h1>
                <p className="mt-1 text-sm text-secondary">
                  Applied {formatOpportunityDate(application.appliedAt)}
                </p>
              </div>
              <Badge variant={applicationStatusVariant(application.status)}>
                {applicationStatusLabel(application.status)}
              </Badge>
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

            {match ? (
              <Card className="mt-6 p-5">
                <h2 className="text-sm font-semibold text-text">Skill match</h2>
                <MatchScore match={{ available: true, ...match }} className="mt-2" />
                {match.summary ? (
                  <p className="mt-3 text-sm text-secondary">{match.summary}</p>
                ) : null}
                {match.skills?.length ? (
                  <ul className="mt-3 grid gap-1">
                    {match.skills.map((item) => (
                      <SkillMatchRow key={item.skillId} item={item} />
                    ))}
                  </ul>
                ) : null}
              </Card>
            ) : null}

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Cover letter</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">
                {application.coverLetter || "No cover letter provided."}
              </p>
              {application.resumeUrl ? (
                <p className="mt-3 text-sm">
                  Resume:{" "}
                  <a href={application.resumeUrl} className="text-primary" target="_blank" rel="noreferrer">
                    {application.resumeUrl}
                  </a>
                </p>
              ) : null}
            </Card>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Application timeline</h2>
              <p className="mt-1 text-xs text-secondary">
                Derived from current status. Intermediate timestamps are not stored in this phase.
              </p>
              <ol className="mt-4 grid gap-2">
                {(application.timeline || []).map((step) => (
                  <li key={step.status} className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-medium text-text">{step.label}</span>
                    <span className="text-secondary">
                      {step.at ? formatOpportunityDate(step.at) : "—"}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2">
              {application.opportunity?.id ? (
                <Link to={`/app/opportunities/${application.opportunity.id}`}>
                  <Button size="sm" variant="secondary">
                    View opportunity
                  </Button>
                </Link>
              ) : null}
              {canWithdraw(application.status) ? (
                <Button size="sm" variant="ghost" disabled={busy} onClick={handleWithdraw}>
                  Withdraw
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
