import { useAuth } from "../context/AuthContext.jsx";
import { AcademicianDashboard } from "./dashboard/AcademicianDashboard.jsx";
import { AdminDashboard } from "./dashboard/AdminDashboard.jsx";
import { IndustryDashboard } from "./dashboard/IndustryDashboard.jsx";
import { InstitutionDashboard } from "./dashboard/InstitutionDashboard.jsx";
import { StudentDashboard } from "./dashboard/StudentDashboard.jsx";

export function AppShellPage() {
  const { user } = useAuth();

  if (user?.role === "INDUSTRY") {
    return <IndustryDashboard />;
  }
  if (user?.role === "INSTITUTION") {
    return <InstitutionDashboard />;
  }
  if (user?.role === "ACADEMICIAN") {
    return <AcademicianDashboard />;
  }
  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
}
