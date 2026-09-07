import { Layers } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";

const ROLE_LABELS = {
  STUDENT: "Student",
  INDUSTRY: "Industry",
  ACADEMICIAN: "Academician",
  INSTITUTION: "Institution",
  ADMIN: "Admin",
};

export function AppShellPage() {
  const { user } = useAuth();
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary">
          Signed in as {user?.name} · {roleLabel}. Students can apply to published
          opportunities and track application status. Industry can review applicants
          for their own listings.
        </p>
        <div className="mt-6 rounded-md border border-border bg-surface">
          <EmptyState
            icon={Layers}
            title="Workspace overview"
            description="Skill assessment, career roadmap, opportunities, applications, and explainable matching are available from the sidebar. Candidate ranking and institution analytics arrive in later phases."
          />
        </div>
      </div>
    </AppLayout>
  );
}
