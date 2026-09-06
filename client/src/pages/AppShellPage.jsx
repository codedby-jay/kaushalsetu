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
          Signed in as {user?.name} · {roleLabel}. Role-specific modules will be
          introduced in later phases.
        </p>
        <div className="mt-6 rounded-md border border-border bg-surface">
          <EmptyState
            icon={Layers}
            title="Modules arrive in later phases"
            description="Student profiles, skill assessment, opportunity matching, applications, and institution analytics will be built phase by phase. The navigation on the left is a structural placeholder and is not connected to those features yet."
          />
        </div>
      </div>
    </AppLayout>
  );
}
