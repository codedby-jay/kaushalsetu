import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { DashboardSection } from "../../components/dashboard/DashboardWidgets.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAcademicianDashboard, getApiErrorMessage } from "../../services/api.js";
import { typeLabel } from "../../utils/opportunity.js";

export function AcademicianDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getAcademicianDashboard();
        setDashboard(result.data.dashboard);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load dashboard."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Academician workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-text">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-secondary">
          A lightweight workspace until faculty collaboration modules arrive.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-secondary">Loading dashboard…</p>
        ) : error ? (
          <Card className="mt-6 p-6">
            <p className="text-sm text-danger">{error}</p>
          </Card>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <DashboardSection title="Account">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-secondary">Name</dt>
                  <dd className="font-medium text-text">{dashboard.user.name}</dd>
                </div>
                <div>
                  <dt className="text-secondary">Email</dt>
                  <dd className="font-medium text-text">{dashboard.user.email}</dd>
                </div>
                <div>
                  <dt className="text-secondary">Role</dt>
                  <dd>
                    <Badge variant="primary">Academician</Badge>
                  </dd>
                </div>
              </dl>
            </DashboardSection>

            <Card>
              <EmptyState
                className="py-12"
                title="Collaboration coming in the next phase"
                description={dashboard.message}
              />
            </Card>

            <DashboardSection
              title="Industry activity on the portal"
              description="Published opportunities currently visible on KaushalSetu. This is a market snapshot, not a faculty matching module."
            >
              {dashboard.industryActivity.length === 0 ? (
                <p className="text-sm text-secondary">No published industry opportunities yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {dashboard.industryActivity.map((item) => (
                    <li key={`${item.companyName}-${item.title}`} className="py-3">
                      <p className="font-medium text-text">{item.title}</p>
                      <p className="text-secondary">
                        {item.companyName} · {typeLabel(item.type)} · {item.location}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
