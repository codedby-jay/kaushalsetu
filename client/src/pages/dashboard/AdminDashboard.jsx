import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { DashboardSection } from "../../components/dashboard/DashboardWidgets.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Admin</p>
        <h1 className="mt-1 text-xl font-semibold text-text">Administration</h1>
        <p className="mt-1 text-sm text-secondary">
          Signed in as {user?.name}. User management and platform operations are not part of this
          phase.
        </p>

        <DashboardSection className="mt-6" title="Account">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-secondary">Name</dt>
              <dd className="font-medium text-text">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-secondary">Email</dt>
              <dd className="font-medium text-text">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-secondary">Role</dt>
              <dd>
                <Badge variant="primary">Admin</Badge>
              </dd>
            </div>
          </dl>
        </DashboardSection>

        <Card className="mt-5">
          <EmptyState
            title="Admin tools arrive later"
            description="Institution analytics stay restricted to INSTITUTION accounts. This workspace does not expose student, company, or platform analytics."
          />
        </Card>
      </div>
    </AppLayout>
  );
}
