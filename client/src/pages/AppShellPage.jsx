import { Layers } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";

export function AppShellPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary">
          This is the application shell. Role-specific modules will be introduced
          in later phases.
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
