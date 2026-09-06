import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  createCompanyProfile,
  getApiErrorMessage,
  getCompanyProfile,
  updateCompanyProfile,
} from "../../services/api.js";

const EMPTY_FORM = {
  companyName: "",
  description: "",
  industry: "",
  website: "",
  location: "",
  companySize: "",
  logoUrl: "",
};

function toForm(profile) {
  if (!profile) {
    return { ...EMPTY_FORM };
  }
  return {
    companyName: profile.companyName || "",
    description: profile.description || "",
    industry: profile.industry || "",
    website: profile.website || "",
    location: profile.location || "",
    companySize: profile.companySize || "",
    logoUrl: profile.logoUrl || "",
  };
}

export function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exists, setExists] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getCompanyProfile();
      setExists(result.data.exists);
      setProfile(result.data.profile);
      setForm(toForm(result.data.profile));
      setEditing(!result.data.exists);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load company profile."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        website: form.website || null,
        location: form.location || null,
        companySize: form.companySize || null,
        logoUrl: form.logoUrl || null,
      };
      const result = exists
        ? await updateCompanyProfile(payload)
        : await createCompanyProfile(payload);
      setExists(true);
      setProfile(result.data.profile);
      setForm(toForm(result.data.profile));
      setEditing(false);
      setNotice(exists ? "Company profile updated." : "Company profile created.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save company profile."));
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
        <h1 className="mt-1 text-xl font-semibold text-text">Company Profile</h1>
        <p className="mt-1 text-sm text-secondary">
          This profile is attached to your signed-in industry account. Students see
          company details on published opportunities.
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
          <p className="mt-8 text-sm text-secondary">Loading company profile…</p>
        ) : !exists && !editing ? (
          <Card className="mt-6 p-6">
            <EmptyState
              title="No company profile yet"
              description="Create a company profile before you publish internships or jobs."
              action={<Button onClick={() => setEditing(true)}>Create profile</Button>}
            />
          </Card>
        ) : (
          <Card className="mt-6 p-6">
            {editing ? (
              <form className="grid gap-4" onSubmit={handleSave}>
                <Input
                  id="companyName"
                  label="Company name"
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  required
                />
                <Textarea
                  id="description"
                  label="Description"
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="industry"
                    label="Industry"
                    value={form.industry}
                    onChange={(event) => updateField("industry", event.target.value)}
                    required
                  />
                  <Input
                    id="location"
                    label="Location"
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="website"
                    label="Website"
                    type="url"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                    hint="Optional https URL"
                  />
                  <Input
                    id="companySize"
                    label="Company size"
                    value={form.companySize}
                    onChange={(event) => updateField("companySize", event.target.value)}
                    hint="Example: 51-200"
                  />
                </div>
                <Input
                  id="logoUrl"
                  label="Logo URL"
                  type="url"
                  value={form.logoUrl}
                  onChange={(event) => updateField("logoUrl", event.target.value)}
                  hint="Optional. Image hosting is not included in this phase."
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  {exists ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setForm(toForm(profile));
                        setEditing(false);
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            ) : (
              <div className="grid gap-4">
                <Detail label="Company name" value={profile.companyName} />
                <Detail label="Description" value={profile.description} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Industry" value={profile.industry} />
                  <Detail label="Location" value={profile.location || "—"} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Website" value={profile.website || "—"} />
                  <Detail label="Company size" value={profile.companySize || "—"} />
                </div>
                <Detail label="Logo URL" value={profile.logoUrl || "—"} />
                <div>
                  <Button type="button" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-text">{value}</p>
    </div>
  );
}
