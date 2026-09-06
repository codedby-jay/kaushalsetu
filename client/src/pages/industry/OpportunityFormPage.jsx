import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  createIndustryOpportunity,
  getApiErrorMessage,
  getCompanyProfile,
  getIndustryOpportunity,
  getSkills,
  publishIndustryOpportunity,
  updateIndustryOpportunity,
} from "../../services/api.js";
import { dateInputValue } from "../../utils/opportunity.js";
import { cn } from "../../utils/cn.js";

const EMPTY_FORM = {
  title: "",
  type: "INTERNSHIP",
  description: "",
  location: "",
  workMode: "HYBRID",
  duration: "",
  stipend: "",
  salaryMin: "",
  salaryMax: "",
  applicationDeadline: "",
};

const selectClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

function toPayload(form, skillRows) {
  return {
    title: form.title,
    type: form.type,
    description: form.description,
    location: form.location,
    workMode: form.workMode,
    duration: form.duration || null,
    stipend: form.stipend === "" ? null : Number(form.stipend),
    salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
    applicationDeadline: form.applicationDeadline || null,
    skills: skillRows
      .filter((row) => row.skillId)
      .map((row) => ({
        skillId: row.skillId,
        requiredProficiency: Number(row.requiredProficiency),
        isRequired: row.isRequired,
      })),
  };
}

export function OpportunityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCompany, setHasCompany] = useState(true);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillRows, setSkillRows] = useState([
    { key: "new-1", skillId: "", requiredProficiency: 6, isRequired: true },
  ]);

  const usedSkillIds = useMemo(
    () => new Set(skillRows.map((row) => row.skillId).filter(Boolean)),
    [skillRows],
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const company = await getCompanyProfile();
      setHasCompany(company.data.exists);
      if (!company.data.exists) {
        return;
      }
      const skillsResult = await getSkills();
      setCatalog(skillsResult.data.skills);
      if (isEdit) {
        const result = await getIndustryOpportunity(id);
        const opportunity = result.data.opportunity;
        setForm({
          title: opportunity.title || "",
          type: opportunity.type || "INTERNSHIP",
          description: opportunity.description || "",
          location: opportunity.location || "",
          workMode: opportunity.workMode || "HYBRID",
          duration: opportunity.duration || "",
          stipend: opportunity.stipend ?? "",
          salaryMin: opportunity.salaryMin ?? "",
          salaryMax: opportunity.salaryMax ?? "",
          applicationDeadline: dateInputValue(opportunity.applicationDeadline),
        });
        setSkillRows(
          opportunity.skills.length
            ? opportunity.skills.map((skill) => ({
                key: skill.id,
                skillId: skill.skillId,
                requiredProficiency: skill.requiredProficiency,
                isRequired: skill.isRequired,
              }))
            : [{ key: "new-1", skillId: "", requiredProficiency: 6, isRequired: true }],
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load the form."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateSkillRow(key, patch) {
    setSkillRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  async function save(shouldPublish) {
    setSaving(true);
    setError("");
    try {
      const payload = toPayload(form, skillRows);
      const saved = isEdit
        ? await updateIndustryOpportunity(id, payload)
        : await createIndustryOpportunity(payload);
      const opportunityId = saved.data.opportunity.id;
      if (shouldPublish) {
        await publishIndustryOpportunity(opportunityId);
      }
      navigate("/app/opportunities/manage");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save opportunity."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Industry
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">
          {isEdit ? "Edit opportunity" : "Create opportunity"}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Drafts stay private. Publishing makes the listing visible to students. Matching
          scores are not calculated in this phase.
        </p>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading form…</p>
        ) : !hasCompany ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="Create a company profile first"
              description="You cannot attach an opportunity to another account’s company."
              action={
                <Link to="/app/company-profile">
                  <Button>Company profile</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save(false);
            }}
          >
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-text">1. Basic information</h2>
              <div className="mt-4 grid gap-4">
                <Input
                  id="title"
                  label="Title"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  required
                />
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="type" className="text-sm font-medium text-text">
                    Type
                  </label>
                  <select
                    id="type"
                    className={selectClass}
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="JOB">Job</option>
                    <option value="APPRENTICESHIP">Apprenticeship</option>
                  </select>
                </div>
                <Textarea
                  id="description"
                  label="Description"
                  rows={6}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-text">2. Location and work mode</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Input
                  id="location"
                  label="Location"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  required
                />
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="workMode" className="text-sm font-medium text-text">
                    Work mode
                  </label>
                  <select
                    id="workMode"
                    className={selectClass}
                    value={form.workMode}
                    onChange={(event) => updateField("workMode", event.target.value)}
                  >
                    <option value="ONSITE">On-site</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <Input
                  id="duration"
                  label="Duration"
                  value={form.duration}
                  onChange={(event) => updateField("duration", event.target.value)}
                  hint="Example: 6 months"
                />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-text">3. Compensation</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Input
                  id="stipend"
                  label="Stipend"
                  type="number"
                  min="0"
                  value={form.stipend}
                  onChange={(event) => updateField("stipend", event.target.value)}
                  hint="INR / month"
                />
                <Input
                  id="salaryMin"
                  label="Salary min"
                  type="number"
                  min="0"
                  value={form.salaryMin}
                  onChange={(event) => updateField("salaryMin", event.target.value)}
                  hint="INR / year"
                />
                <Input
                  id="salaryMax"
                  label="Salary max"
                  type="number"
                  min="0"
                  value={form.salaryMax}
                  onChange={(event) => updateField("salaryMax", event.target.value)}
                  hint="INR / year"
                />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-text">4. Deadline</h2>
              <div className="mt-4 max-w-xs">
                <Input
                  id="applicationDeadline"
                  label="Application deadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(event) => updateField("applicationDeadline", event.target.value)}
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-text">5. Required skills</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSkillRows((current) => [
                      ...current,
                      {
                        key: `new-${Date.now()}`,
                        skillId: "",
                        requiredProficiency: 5,
                        isRequired: true,
                      },
                    ])
                  }
                >
                  Add skill
                </Button>
              </div>
              <div className="mt-4 grid gap-3">
                {skillRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_110px_120px_auto] sm:items-end"
                  >
                    <div className="flex w-full flex-col gap-1.5">
                      <label className="text-sm font-medium text-text" htmlFor={`skill-${row.key}`}>
                        Skill
                      </label>
                      <select
                        id={`skill-${row.key}`}
                        className={selectClass}
                        value={row.skillId}
                        onChange={(event) =>
                          updateSkillRow(row.key, { skillId: event.target.value })
                        }
                      >
                        <option value="">Select skill</option>
                        {catalog.map((skill) => (
                          <option
                            key={skill.id}
                            value={skill.id}
                            disabled={usedSkillIds.has(skill.id) && skill.id !== row.skillId}
                          >
                            {skill.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      id={`prof-${row.key}`}
                      label="Proficiency"
                      type="number"
                      min="0"
                      max="10"
                      value={row.requiredProficiency}
                      onChange={(event) =>
                        updateSkillRow(row.key, {
                          requiredProficiency: event.target.value,
                        })
                      }
                    />
                    <label className={cn("flex h-10 items-center gap-2 text-sm text-text")}>
                      <input
                        type="checkbox"
                        checked={row.isRequired}
                        onChange={(event) =>
                          updateSkillRow(row.key, { isRequired: event.target.checked })
                        }
                      />
                      Required
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSkillRows((current) => current.filter((item) => item.key !== row.key))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="secondary" disabled={saving}>
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button type="button" disabled={saving} onClick={() => save(true)}>
                Publish
              </Button>
              <Link to="/app/opportunities/manage">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
