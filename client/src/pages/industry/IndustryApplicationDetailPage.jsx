import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { MatchScore, SkillMatchRow } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getIndustryApplication,
  updateIndustryApplicationStatus,
} from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
  industryStatusActions,
} from "../../utils/application.js";
import { formatOpportunityDate } from "../../utils/opportunity.js";
import { requiredSkillsLabel } from "../../utils/ranking.js";

export function IndustryApplicationDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [application, setApplication] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getIndustryApplication(id);
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

  async function handleStatus(nextStatus) {
    setBusy(nextStatus);
    setError("");
    setNotice("");
    try {
      const result = await updateIndustryApplicationStatus(id, nextStatus);
      setApplication(result.data.application);
      setNotice(`Status updated to ${applicationStatusLabel(nextStatus)}.`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update status."));
    } finally {
      setBusy("");
    }
  }

  const actions = industryStatusActions(application?.status);
  const match = application?.match;
  const applicant = application?.applicant;
  const ranking = application?.ranking;
  const matchedSkills = match?.matchedSkills || match?.skills?.filter((item) => item.status === "MATCHED") || [];
  const partialSkills = match?.partialSkills || match?.skills?.filter((item) => item.status === "PARTIAL") || [];
  const gapSkills =
    match?.skills?.filter((item) => item.status === "GAP") ||
    match?.skillGaps?.filter((item) => item.status === "GAP") ||
    [];

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        {application?.opportunity?.id ? (
          <Link
            to={`/app/opportunities/${application.opportunity.id}/applications`}
            className="text-sm text-primary no-underline hover:underline"
          >
            Back to ranked candidates
          </Link>
        ) : (
          <Link
            to="/app/opportunities/manage"
            className="text-sm text-primary no-underline hover:underline"
          >
            Back to opportunities
          </Link>
        )}

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
                <h1 className="text-xl font-semibold text-text">{applicant?.name}</h1>
                <p className="mt-1 text-sm text-secondary">{applicant?.email}</p>
                <p className="mt-1 text-sm text-secondary">
                  {application.opportunity?.title} · Applied{" "}
                  {formatOpportunityDate(application.appliedAt)}
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

            {applicant ? (
              <Card className="mt-6 p-5">
                <h2 className="text-sm font-semibold text-text">Applicant</h2>
                <dl className="mt-3 grid gap-2 text-sm">
                  <Row label="Headline" value={applicant.headline || "—"} />
                  <Row label="College" value={applicant.college || "—"} />
                  <Row label="Education" value={applicant.education || applicant.degree || "—"} />
                  <Row label="Graduation year" value={applicant.graduationYear || "—"} />
                  <Row label="Location" value={applicant.location || "—"} />
                </dl>
              </Card>
            ) : null}

            {match ? (
              <Card className="mt-4 p-5">
                <h2 className="text-sm font-semibold text-text">Candidate fit</h2>
                <p className="mt-1 text-xs text-secondary">
                  Live skill-based ranking using the Phase 6 match score. This is not an AI score.
                </p>
                <MatchScore match={{ available: true, ...match }} className="mt-2" />
                {ranking ? (
                  <p className="mt-3 text-sm text-text">
                    Required skill coverage: {requiredSkillsLabel(ranking)}
                    {ranking.requiredCount
                      ? ` (${ranking.requiredSkillCoverage}%)`
                      : ""}
                  </p>
                ) : null}
                {match.summary ? (
                  <p className="mt-3 text-sm text-secondary">{match.summary}</p>
                ) : null}

                <SkillGroup title="Strong skills" items={matchedSkills} empty="No required skills are fully met yet." />
                <SkillGroup title="Partial" items={partialSkills} empty="No partial skills." />
                <SkillGroup title="Skill gaps" items={gapSkills} empty="No outstanding skill gaps." />
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
              <h2 className="text-sm font-semibold text-text">Update status</h2>
              <p className="mt-1 text-sm text-secondary">
                Current status: {applicationStatusLabel(application.status)}
              </p>
              {actions.length === 0 ? (
                <p className="mt-3 text-sm text-secondary">
                  This application is in a terminal state and cannot be moved.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={action.variant}
                      disabled={Boolean(busy)}
                      onClick={() => handleStatus(action.status)}
                    >
                      {busy === action.status ? "Updating…" : action.label}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SkillGroup({ title, items, empty }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-secondary">{empty}</p>
      ) : (
        <ul className="mt-2 grid gap-1">
          {items.map((item) => (
            <SkillMatchRow key={item.skillId} item={item} />
          ))}
        </ul>
      )}
    </div>
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
