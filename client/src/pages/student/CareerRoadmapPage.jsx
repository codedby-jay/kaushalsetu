import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { MatchScore } from "../../components/ui/MatchScore.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  getApiErrorMessage,
  getCareerRoadmap,
  getCareerRoles,
  saveCareerGoal,
} from "../../services/api.js";

const STATUS_VARIANT = {
  MATCHED: "success",
  PARTIAL: "warning",
  GAP: "danger",
};

const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export function CareerRoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [noProfile, setNoProfile] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    setNoProfile(false);
    try {
      const [roleResult, mapResult] = await Promise.all([
        getCareerRoles(),
        getCareerRoadmap(),
      ]);
      setRoles(roleResult.data.roles);
      setRoadmap(mapResult.data);
      setSelectedRoleId(mapResult.data.role?.id || "");
    } catch (err) {
      if (err.response?.status === 400) {
        setNoProfile(true);
        try {
          const roleResult = await getCareerRoles();
          setRoles(roleResult.data.roles);
        } catch {
          /* ignore */
        }
      } else {
        setError(getApiErrorMessage(err, "Unable to load career roadmap."));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedRoleId) {
      setError("Select a career role.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveCareerGoal({ careerRoleId: selectedRoleId });
      setNotice("Career goal saved.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save career goal."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Career Roadmap</h1>
        <p className="mt-1 text-sm text-secondary">
          Choose a target role. Required skills and recommended assessments come from
          the catalog—not from hardcoded frontend maps. Career readiness uses the same
          explainable formula as opportunity matching.
        </p>

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
          <p className="mt-8 text-sm text-secondary">Loading career roadmap…</p>
        ) : noProfile ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create your profile first"
              description="A student profile is required before you can save a career goal."
              action={
                <Link to="/app/profile">
                  <Button>Create Profile</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <Card className="mt-6 p-5">
              <h2 className="text-sm font-semibold text-text">Choose your career goal</h2>
              <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSave}>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <label htmlFor="careerRole" className="text-sm font-medium text-text">
                    Career role
                  </label>
                  <select
                    id="careerRole"
                    className={selectClass}
                    value={selectedRoleId}
                    onChange={(event) => setSelectedRoleId(event.target.value)}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save career goal"}
                </Button>
              </form>
            </Card>

            {!roadmap?.exists ? (
              <Card className="mt-4 p-6">
                <EmptyState
                  title="Select a career goal to see your skill roadmap"
                  description={roadmap?.message || "Save a role to load required skills and recommended assessments."}
                />
              </Card>
            ) : (
              <>
                <Card className="mt-4 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {roadmap.role.name}
                  </p>
                  <p className="mt-1 text-sm text-secondary">{roadmap.role.description}</p>
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                      Career readiness
                    </p>
                    <MatchScore
                      className="mt-1"
                      match={{
                        available: true,
                        matchPercentage: roadmap.readiness.percentage,
                        band: roadmap.readiness.band,
                        label: roadmap.readiness.label,
                      }}
                    />
                    <p className="mt-2 text-sm text-secondary">{roadmap.summary}</p>
                  </div>
                </Card>

                <Card className="mt-4 p-5">
                  <h2 className="text-sm font-semibold text-text">Required skills</h2>
                  <p className="mt-1 text-xs text-secondary">
                    Current proficiency / role target. Missing skills count as 0.
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {roadmap.skills.map((item) => (
                      <li
                        key={item.skillId}
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-text">
                          {item.skillName}
                          {!item.isRequired ? (
                            <span className="ml-2 text-xs font-normal text-secondary">Optional</span>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="tabular-nums text-secondary">
                            {item.currentProficiency}/{item.requiredProficiency}
                          </span>
                          <Badge variant={STATUS_VARIANT[item.status] || "default"}>
                            {item.status}
                          </Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="mt-4 p-5">
                  <h2 className="text-sm font-semibold text-text">Recommended assessments</h2>
                  {roadmap.recommendedAssessments.length === 0 ? (
                    <p className="mt-2 text-sm text-secondary">{roadmap.message}</p>
                  ) : (
                    <ul className="mt-3 grid gap-3">
                      {roadmap.recommendedAssessments.map((item) => (
                        <li
                          key={item.assessmentId}
                          className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-text">{item.title}</p>
                            <p className="mt-1 text-xs text-secondary">
                              For {item.forSkill.skillName} · current{" "}
                              {item.forSkill.currentProficiency}/{item.forSkill.requiredProficiency} · gap{" "}
                              {item.forSkill.gap} · focus {item.focusPercentage}%
                            </p>
                          </div>
                          <Link to={`/app/assessments/${item.assessmentId}`}>
                            <Button size="sm">Take assessment</Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
