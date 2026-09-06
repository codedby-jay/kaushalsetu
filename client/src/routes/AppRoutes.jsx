import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { RoleRoute } from "../components/auth/RoleRoute.jsx";
import { AppShellPage } from "../pages/AppShellPage.jsx";
import { LandingPage } from "../pages/LandingPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { StudentProfilePage } from "../pages/student/StudentProfilePage.jsx";
import { StudentSkillsPage } from "../pages/student/StudentSkillsPage.jsx";

function StudentRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={["STUDENT"]}>{children}</RoleRoute>
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShellPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <StudentRoute>
            <StudentProfilePage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/skills"
        element={
          <StudentRoute>
            <StudentSkillsPage />
          </StudentRoute>
        }
      />
    </Routes>
  );
}
