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
          Signed in as {user?.name} · {roleLabel}. Industry users can publish
          opportunities. Students can browse published listings. Matching and applications
          remain later phases.
        </p>
        <div className="mt-6 rounded-md border border-border bg-surface">
          <EmptyState
            icon={Layers}
            title="Modules arrive in later phases"
            description="Opportunity matching, applications, and institution analytics will be built in later phases. Skill assessment, Skill Intelligence, and opportunities are available in the sidebar."
          />
        </div>
      </div>
    </AppLayout>
  );
}
