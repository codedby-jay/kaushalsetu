import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  applyToOpportunity,
  getApiErrorMessage,
  getOpportunityMatch,
  getPublishedOpportunity,
} from "../../services/api.js";

export function ApplyOpportunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [opportunity, setOpportunity] = useState(null);
  const [match, setMatch] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [result, matchResult] = await Promise.allSettled([
          getPublishedOpportunity(id),
          getOpportunityMatch(id),
        ]);
        if (result.status === "rejected") {
          throw result.reason;
        }
        const listing = result.value.data.opportunity;
        if (!cancelled) {
          setOpportunity(listing);
        }
        if (listing.myApplication) {
          if (!cancelled) {
            navigate(`/app/applications/${listing.myApplication.id}`, { replace: true });
          }
          return;
        }
        if (matchResult.status === "fulfilled" && !cancelled) {
          setMatch(matchResult.value.data.match);
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
  }, [id, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!confirmed) {
      setError("Confirm that you want to submit this application.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = { coverLetter };
      if (resumeUrl.trim()) {
        payload.resumeUrl = resumeUrl.trim();
      }
      const result = await applyToOpportunity(id, payload);
      setCreated(result.data.application);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to submit application."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/app/opportunities/${id}`}
          className="text-sm text-primary no-underline hover:underline"
        >
          Back to opportunity
        </Link>
        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading application form…</p>
        ) : error && !opportunity ? (
          <p className="mt-6 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : created ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Application submitted successfully."
              description={`${created.opportunity?.title || "This opportunity"} at ${created.opportunity?.company?.companyName || "the company"} is now in your applications.`}
              action={
                <Link to={`/app/applications/${created.id}`}>
                  <Button>View Application</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <h1 className="mt-3 text-xl font-semibold text-text">Apply</h1>
            <p className="mt-1 text-sm text-secondary">
              {opportunity.title} · {opportunity.company?.companyName}
            </p>
            {match ? (
              <Card className="mt-4 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  Skill match
                </p>
                <MatchScore match={{ available: true, ...match }} className="mt-2" />
              </Card>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Card className="mt-4 p-5">
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <Textarea
                  id="coverLetter"
                  label="Cover letter"
                  hint="Optional. Introduce yourself and why this role fits."
                  rows={8}
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                />
                <Input
                  id="resumeUrl"
                  label="Resume URL"
                  hint="Optional public http(s) link. File upload is not available in this phase."
                  value={resumeUrl}
                  onChange={(event) => setResumeUrl(event.target.value)}
                  placeholder="https://"
                />
                <label className="flex items-start gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  I confirm I want to submit this application. I can apply only once.
                </label>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </Button>
              </form>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
