import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { MatchScore, SkillMatchRow } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { getApiErrorMessage, getPublishedOpportunities } from "../../services/api.js";
import {
  formatOpportunityDate,
  typeLabel,
  workModeLabel,
} from "../../utils/opportunity.js";
import { applicationStatusLabel } from "../../utils/application.js";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export function StudentOpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opportunities, setOpportunities] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    workMode: "",
    location: "",
  });
  const [applied, setApplied] = useState({
    search: "",
    type: "",
    workMode: "",
    location: "",
  });

  async function load(nextFilters = applied) {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (nextFilters.search) {
        params.search = nextFilters.search;
      }
      if (nextFilters.type) {
        params.type = nextFilters.type;
      }
      if (nextFilters.workMode) {
        params.workMode = nextFilters.workMode;
      }
      if (nextFilters.location) {
        params.location = nextFilters.location;
      }
      const result = await getPublishedOpportunities(params);
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

  function handleSubmit(event) {
    event.preventDefault();
    setApplied(filters);
    load(filters);
  }

  const matchReason = opportunities[0]?.match?.reason;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Opportunities</h1>
        <p className="mt-1 text-sm text-secondary">
          Browse published internships and jobs. Skill match compares your proficiency
          (0–10) with each listing’s required proficiency. This is an explainable
          formula, not an AI model.
        </p>

        <Card className="mt-6 p-4">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>
            <Input
              id="search"
              label="Search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="React, Chennai…"
            />
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="type" className="text-sm font-medium text-text">
                Type
              </label>
              <select
                id="type"
                className={selectClass}
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, type: event.target.value }))
                }
              >
                <option value="">All types</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Job</option>
              </select>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="workMode" className="text-sm font-medium text-text">
                Work mode
              </label>
              <select
                id="workMode"
                className={selectClass}
                value={filters.workMode}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, workMode: event.target.value }))
                }
              >
                <option value="">All modes</option>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <Input
              id="location"
              label="Location"
              value={filters.location}
              onChange={(event) =>
                setFilters((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Chennai"
            />
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">Apply filters</Button>
            </div>
          </form>
        </Card>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {!loading && matchReason === "NO_PROFILE" ? (
          <Card className="mt-4 p-5">
            <EmptyState
              title="Create your profile to see your opportunity match"
              description="Listings are still visible. A student profile is required before skill match can be calculated."
              action={
                <Link to="/app/profile">
                  <Button>Create Profile</Button>
                </Link>
              }
            />
          </Card>
        ) : null}

        {!loading && matchReason === "NO_SKILLS" ? (
          <Card className="mt-4 p-5">
            <EmptyState
              title="Add skills to your profile to calculate your match"
              description="Match scores use your StudentSkill proficiency against each opportunity’s required proficiency."
              action={
                <Link to="/app/skills">
                  <Button>Add Skills</Button>
                </Link>
              }
            />
          </Card>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading opportunities…</p>
        ) : opportunities.length === 0 ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="No published opportunities"
              description="Try a broader search. Draft and closed listings are not shown."
            />
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {opportunities.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text">{item.title}</h2>
                    <p className="mt-1 text-sm text-secondary">
                      {item.company?.companyName}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      {item.location} · {workModeLabel(item.workMode)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="primary">{typeLabel(item.type)}</Badge>
                    {item.match?.available ? <MatchScore match={item.match} /> : null}
                  </div>
                </div>
                {item.duration ? (
                  <p className="mt-3 text-sm text-text">{item.duration}</p>
                ) : null}
                {item.match?.available ? (
                  <>
                    <p className="mt-3 text-sm text-secondary">{item.match.summary}</p>
                    <ul className="mt-3 grid gap-1">
                      {(item.match.skills || []).slice(0, 4).map((skill) => (
                        <SkillMatchRow key={skill.skillId} item={skill} />
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.skills.map((skill) => (
                      <Badge key={skill.skillId}>
                        {skill.name} {skill.requiredProficiency}/10
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-secondary">
                  Application deadline: {formatOpportunityDate(item.applicationDeadline)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/app/opportunities/${item.id}`}>
                    <Button size="sm">View details</Button>
                  </Link>
                  {item.myApplication ? (
                    <Link to={`/app/applications/${item.myApplication.id}`}>
                      <Button size="sm" variant="secondary">
                        Applied · {applicationStatusLabel(item.myApplication.status)}
                      </Button>
                    </Link>
                  ) : null}
                  {item.match?.available ? (
                    <Link to={`/app/opportunities/${item.id}#your-match`}>
                      <Button size="sm" variant="secondary">
                        Why this match?
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
