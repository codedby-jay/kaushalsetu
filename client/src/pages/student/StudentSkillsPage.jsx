import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  addStudentSkill,
  getApiErrorMessage,
  getSkills,
  getStudentProfile,
  getStudentSkills,
  removeStudentSkill,
  updateStudentSkill,
} from "../../services/api.js";
import { proficiencyLabel } from "../../utils/profile.js";

export function StudentSkillsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasProfile, setHasProfile] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [grouped, setGrouped] = useState({ TECHNICAL: [], SOFT: [] });
  const [summary, setSummary] = useState({
    total: 0,
    technical: 0,
    soft: 0,
    averageProficiency: 0,
  });
  const [skillId, setSkillId] = useState("");
  const [proficiency, setProficiency] = useState(6);
  const [saving, setSaving] = useState(false);

  const availableCatalog = useMemo(() => {
    const owned = new Set([
      ...grouped.TECHNICAL.map((item) => item.skillId),
      ...grouped.SOFT.map((item) => item.skillId),
    ]);
    return catalog.filter((item) => !owned.has(item.id));
  }, [catalog, grouped]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const profile = await getStudentProfile();
      setHasProfile(profile.data.exists);
      if (!profile.data.exists) {
        setGrouped({ TECHNICAL: [], SOFT: [] });
        setSummary({ total: 0, technical: 0, soft: 0, averageProficiency: 0 });
        return;
      }
      const [mine, list] = await Promise.all([getStudentSkills(), getSkills()]);
      setGrouped(mine.data.grouped);
      setSummary(mine.data.summary);
      setCatalog(list.data.skills);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load your skills. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    if (!skillId) {
      setError("Select a skill to add.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await addStudentSkill({ skillId, proficiency: Number(proficiency) });
      setSkillId("");
      setNotice("Skill added.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to add skill."));
    } finally {
      setSaving(false);
    }
  }

  async function handleProficiency(item, nextValue) {
    setError("");
    try {
      await updateStudentSkill(item.skillId, { proficiency: Number(nextValue) });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update proficiency."));
    }
  }

  async function handleRemove(item) {
    setError("");
    try {
      await removeStudentSkill(item.skillId);
      setNotice(`${item.name} removed.`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to remove skill."));
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Student
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">My Skills</h1>
        <p className="mt-1 text-sm text-secondary">
          Manage your skills and proficiency levels.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading skills…</p>
        ) : !hasProfile ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create a profile first"
              description="Your student profile hasn't been created yet. Skills are attached to that profile."
              action={
                <Link to="/app/profile">
                  <Button>Create Profile</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <SummaryCard label="Total skills" value={summary.total} />
              <SummaryCard label="Technical skills" value={summary.technical} />
              <SummaryCard label="Soft skills" value={summary.soft} />
              <SummaryCard
                label="Average proficiency"
                value={summary.averageProficiency}
              />
            </div>

            <Card className="mt-4 p-5">
              <h2 className="text-sm font-semibold text-text">Add skill</h2>
              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={handleAdd}
              >
                <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-text">
                  Skill
                  <select
                    className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-normal"
                    value={skillId}
                    onChange={(event) => setSkillId(event.target.value)}
                  >
                    <option value="">Select a skill</option>
                    {availableCatalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category === "TECHNICAL" ? "Technical" : "Soft"})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-text sm:w-40">
                  Proficiency
                  <select
                    className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-normal"
                    value={proficiency}
                    onChange={(event) => setProficiency(event.target.value)}
                  >
                    {Array.from({ length: 11 }, (_, index) => (
                      <option key={index} value={index}>
                        {index} · {proficiencyLabel(index)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" disabled={saving}>
                  {saving ? "Adding…" : "Add skill"}
                </Button>
              </form>
            </Card>

            {error ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mt-4 text-sm text-success" role="status">
                {notice}
              </p>
            ) : null}

            {summary.total === 0 ? (
              <Card className="mt-4 p-6">
                <EmptyState
                  title="You haven't added any skills yet."
                  description="Choose a skill from the catalog and set a proficiency from 0 to 10."
                />
              </Card>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <SkillGroup
                  title="Technical skills"
                  items={grouped.TECHNICAL}
                  onChange={handleProficiency}
                  onRemove={handleRemove}
                />
                <SkillGroup
                  title="Soft skills"
                  items={grouped.SOFT}
                  onChange={handleProficiency}
                  onRemove={handleRemove}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-text">{value}</p>
    </Card>
  );
}

function SkillGroup({ title, items, onChange, onRemove }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-secondary">None added yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.skillId}
              className="rounded-md border border-border px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">{item.name}</p>
                  <p className="mt-0.5 text-xs text-secondary">
                    {proficiencyLabel(item.proficiency)} · {item.proficiency} / 10
                  </p>
                </div>
                <Badge>{item.category === "TECHNICAL" ? "Technical" : "Soft"}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={item.proficiency}
                  onChange={(event) => onChange(item, event.target.value)}
                  className="w-full accent-primary"
                  aria-label={`${item.name} proficiency`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onRemove(item)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
