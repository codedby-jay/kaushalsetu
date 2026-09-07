import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { MatchScore, SkillMatchRow } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getApiErrorMessage,
  getIndustryOpportunity,
  getOpportunityMatch,
  getPublishedOpportunity,
} from "../../services/api.js";
import {
  applicationStatusLabel,
  applicationStatusVariant,
} from "../../utils/application.js";
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
  const [match, setMatch] = useState(null);
  const [matchReason, setMatchReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setMatch(null);
      setMatchReason("");
      try {
        if (isIndustry) {
          const result = await getIndustryOpportunity(id);
          if (!cancelled) {
            setOpportunity(result.data.opportunity);
          }
        } else {
          const [result, matchResult] = await Promise.allSettled([
            getPublishedOpportunity(id),
            getOpportunityMatch(id),
          ]);
          if (result.status === "rejected") {
            throw result.reason;
          }
          if (!cancelled) {
            setOpportunity(result.value.data.opportunity);
          }
          if (matchResult.status === "fulfilled") {
            if (!cancelled) {
              setMatch(matchResult.value.data.match);
            }
          } else {
            const status = matchResult.reason?.response?.status;
            const message = getApiErrorMessage(
              matchResult.reason,
              "Unable to calculate skill match.",
            );
            if (status === 400) {
              if (!cancelled) {
                setMatchReason("NO_PROFILE");
              }
            } else if (!cancelled) {
              setMatchReason(message);
            }
          }
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

  useEffect(() => {
    if (loading || !window.location.hash) {
      return;
    }
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, match, matchReason]);

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
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/app/opportunities/${opportunity.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
                <Link to={`/app/opportunities/${opportunity.id}/applications`}>
                  <Button size="sm">
                    Applications ({opportunity.applicationCount ?? 0})
                  </Button>
                </Link>
              </div>
            ) : isIndustry ? (
              <div className="mt-4">
                <Link to={`/app/opportunities/${opportunity.id}/applications`}>
                  <Button size="sm">
                    Applications ({opportunity.applicationCount ?? 0})
                  </Button>
                </Link>
              </div>
            ) : null}

            {!isIndustry ? (
              <Card className="mt-6 scroll-mt-20 p-5" id="your-match">
                <h2 className="text-sm font-semibold text-text">Your match</h2>
                <p className="mt-1 text-xs text-secondary">
                  Skill-based, explainable comparison of your proficiency with this
                  listing’s requirements. Not an AI score.
                </p>
                {matchReason === "NO_PROFILE" ? (
                  <div className="mt-4">
                    <EmptyState
                      title="Create your profile to see your opportunity match"
                      description="The listing is visible. Matching needs a student profile and skills."
                      action={
                        <Link to="/app/profile">
                          <Button>Create Profile</Button>
                        </Link>
                      }
                    />
                  </div>
                ) : match && match.hasStudentSkills === false ? (
                  <div className="mt-4">
                    <EmptyState
                      title="Add skills to your profile to calculate your match"
                      description="Without StudentSkill records, every requirement is treated as proficiency 0."
                      action={
                        <Link to="/app/skills">
                          <Button>Add Skills</Button>
                        </Link>
                      }
                    />
                  </div>
                ) : match ? (
                  <div className="mt-4">
                    <MatchScore
                      match={{ available: true, ...match }}
                    />
                    <p className="mt-3 text-sm text-secondary">{match.summary}</p>
                    {match.matchedSkills?.length ? (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          Matched skills
                        </h3>
                        <ul className="mt-2 grid gap-1">
                          {match.matchedSkills.map((item) => (
                            <SkillMatchRow key={item.skillId} item={item} />
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {match.skillGaps?.length ? (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          Skill gaps
                        </h3>
                        <ul className="mt-2 grid gap-1">
                          {match.skillGaps.map((item) => (
                            <SkillMatchRow key={item.skillId} item={item} />
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {match.recommendation ? (
                      <p className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm text-text">
                        {match.recommendation}
                      </p>
                    ) : null}
                  </div>
                ) : matchReason ? (
                  <p className="mt-3 text-sm text-danger">{matchReason}</p>
                ) : null}
              </Card>
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
                Proficiency is required on a 0–10 scale. Optional skills use half weight in
                the skill match.
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
                {opportunity.myApplication ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text">Applied</p>
                      <p className="mt-1 text-sm text-secondary">
                        Status: {applicationStatusLabel(opportunity.myApplication.status)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={applicationStatusVariant(opportunity.myApplication.status)}>
                        {applicationStatusLabel(opportunity.myApplication.status)}
                      </Badge>
                      <Link to={`/app/applications/${opportunity.myApplication.id}`}>
                        <Button size="sm" variant="secondary">
                          View application
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-secondary">
                      Students can apply once. Cover letter is optional; resume upload is not included in this phase.
                    </p>
                    <Link to={`/app/opportunities/${opportunity.id}/apply`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </div>
                )}
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
