import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { ProgressBar } from "../../components/ui/ProgressBar.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import {
  createStudentProfile,
  deleteStudentProfile,
  getApiErrorMessage,
  getStudentProfile,
  getStudentSkills,
  updateStudentProfile,
} from "../../services/api.js";
import { getProfileCompletion } from "../../utils/profile.js";

const EMPTY_FORM = {
  headline: "",
  bio: "",
  phone: "",
  location: "",
  education: "",
  college: "",
  degree: "",
  graduationYear: "",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
};

function toForm(profile) {
  if (!profile) {
    return { ...EMPTY_FORM };
  }
  return {
    headline: profile.headline || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    location: profile.location || "",
    education: profile.education || "",
    college: profile.college || "",
    degree: profile.degree || "",
    graduationYear: profile.graduationYear ?? "",
    githubUrl: profile.githubUrl || "",
    linkedinUrl: profile.linkedinUrl || "",
    portfolioUrl: profile.portfolioUrl || "",
  };
}

export function StudentProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exists, setExists] = useState(false);
  const [profile, setProfile] = useState(null);
  const [skillCount, setSkillCount] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);

  const completion = useMemo(
    () => getProfileCompletion(exists ? profile : null, skillCount),
    [exists, profile, skillCount],
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getStudentProfile();
      setExists(result.data.exists);
      setProfile(result.data.profile);
      setForm(toForm(result.data.profile));
      try {
        const skills = await getStudentSkills();
        setSkillCount(skills.data.summary.total);
      } catch {
        setSkillCount(0);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load your profile. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      graduationYear: form.graduationYear === "" ? null : Number(form.graduationYear),
    };

    try {
      const result = exists
        ? await updateStudentProfile(payload)
        : await createStudentProfile(payload);
      setExists(true);
      setProfile(result.data.profile);
      setForm(toForm(result.data.profile));
      setNotice(exists ? "Profile saved." : "Profile created.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save your profile."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!exists) {
      return;
    }
    if (!window.confirm("Delete your student profile? Your account will remain.")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await deleteStudentProfile();
      setExists(false);
      setProfile(null);
      setForm({ ...EMPTY_FORM });
      setNotice("Profile deleted. Your account is unchanged.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete your profile."));
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
        <h1 className="mt-1 text-xl font-semibold text-text">Student Profile</h1>
        <p className="mt-1 text-sm text-secondary">
          Name and email come from your account. Complete the rest at your own pace.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading profile…</p>
        ) : error && !profile && !exists ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
            <Button className="mt-4" variant="secondary" onClick={load}>
              Try again
            </Button>
          </Card>
        ) : (
          <>
            <Card className="mt-6 p-5">
              <ProgressBar value={completion} label="Profile completion" />
              <p className="mt-2 text-xs text-secondary">
                This is profile completeness, not industry readiness.
              </p>
            </Card>

            {!exists ? (
              <Card className="mt-4 p-5">
                <EmptyState
                  title="Your student profile hasn't been created yet."
                  description="Fill in the form below and save to create it. You can add skills afterwards."
                  action={
                    <Link to="/app/skills">
                      <Button variant="secondary" size="sm">
                        Go to skills
                      </Button>
                    </Link>
                  }
                />
              </Card>
            ) : null}

            <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Basic information</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input id="name" label="Name" value={user?.name || ""} disabled />
                  <Input id="email" label="Email" value={user?.email || ""} disabled />
                  <div className="sm:col-span-2">
                    <Input
                      id="headline"
                      label="Headline"
                      placeholder="Computer Science student · web development"
                      value={form.headline}
                      onChange={updateField("headline")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      id="bio"
                      label="Bio"
                      placeholder="A short introduction for industry reviewers"
                      value={form.bio}
                      onChange={updateField("bio")}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Contact</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    id="phone"
                    label="Phone"
                    value={form.phone}
                    onChange={updateField("phone")}
                  />
                  <Input
                    id="location"
                    label="Location"
                    placeholder="City, state"
                    value={form.location}
                    onChange={updateField("location")}
                  />
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Education</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    id="college"
                    label="College"
                    value={form.college}
                    onChange={updateField("college")}
                  />
                  <Input
                    id="degree"
                    label="Degree"
                    placeholder="B.Tech Computer Science"
                    value={form.degree}
                    onChange={updateField("degree")}
                  />
                  <Input
                    id="education"
                    label="Education summary"
                    value={form.education}
                    onChange={updateField("education")}
                  />
                  <Input
                    id="graduationYear"
                    label="Graduation year"
                    type="number"
                    value={form.graduationYear}
                    onChange={updateField("graduationYear")}
                  />
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-text">Professional links</h2>
                <div className="mt-4 grid gap-4">
                  <Input
                    id="githubUrl"
                    label="GitHub"
                    placeholder="https://github.com/username"
                    value={form.githubUrl}
                    onChange={updateField("githubUrl")}
                  />
                  <Input
                    id="linkedinUrl"
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedinUrl}
                    onChange={updateField("linkedinUrl")}
                  />
                  <Input
                    id="portfolioUrl"
                    label="Portfolio"
                    placeholder="https://example.com"
                    value={form.portfolioUrl}
                    onChange={updateField("portfolioUrl")}
                  />
                </div>
              </Card>

              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p className="text-sm text-success" role="status">
                  {notice}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : exists ? "Save profile" : "Create profile"}
                </Button>
                {exists ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving}
                    onClick={handleDelete}
                  >
                    Delete profile
                  </Button>
                ) : null}
              </div>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
}
