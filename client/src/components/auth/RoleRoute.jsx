import { EmptyState } from "../ui/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { AppLayout } from "../../layouts/AppLayout.jsx";

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return (
      <AppLayout>
        <EmptyState
          title="Access denied"
          description="This area is not available for your role. The server remains the security boundary for every API call."
        />
      </AppLayout>
    );
  }

  return children;
}
