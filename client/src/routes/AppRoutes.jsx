import { Route, Routes } from "react-router-dom";
import { AppShellPage } from "../pages/AppShellPage.jsx";
import { LandingPage } from "../pages/LandingPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<AppShellPage />} />
    </Routes>
  );
}
