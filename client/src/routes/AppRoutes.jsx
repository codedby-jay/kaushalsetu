import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { RoleRoute } from "../components/auth/RoleRoute.jsx";
import { AppShellPage } from "../pages/AppShellPage.jsx";
import { LandingPage } from "../pages/LandingPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { StudentAssessmentsPage } from "../pages/student/StudentAssessmentsPage.jsx";
import { AssessmentTakePage } from "../pages/student/AssessmentTakePage.jsx";
import { AssessmentResultPage } from "../pages/student/AssessmentResultPage.jsx";
import { SkillIntelligencePage } from "../pages/student/SkillIntelligencePage.jsx";
import { StudentProfilePage } from "../pages/student/StudentProfilePage.jsx";
import { StudentSkillsPage } from "../pages/student/StudentSkillsPage.jsx";
import { CareerRoadmapPage } from "../pages/student/CareerRoadmapPage.jsx";

import { StudentOpportunitiesPage } from "../pages/student/StudentOpportunitiesPage.jsx";
import { StudentApplicationsPage } from "../pages/student/StudentApplicationsPage.jsx";
import { StudentApplicationDetailPage } from "../pages/student/StudentApplicationDetailPage.jsx";
import { ApplyOpportunityPage } from "../pages/student/ApplyOpportunityPage.jsx";
import { CompanyProfilePage } from "../pages/industry/CompanyProfilePage.jsx";
import { IndustryOpportunitiesPage } from "../pages/industry/IndustryOpportunitiesPage.jsx";
import { OpportunityFormPage } from "../pages/industry/OpportunityFormPage.jsx";
import { OpportunityDetailsPage } from "../pages/opportunities/OpportunityDetailsPage.jsx";
import { IndustryOpportunityApplicationsPage } from "../pages/industry/IndustryOpportunityApplicationsPage.jsx";
import { IndustryApplicationDetailPage } from "../pages/industry/IndustryApplicationDetailPage.jsx";
import { IndustryCandidatesPage } from "../pages/industry/IndustryCandidatesPage.jsx";

function StudentRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={["STUDENT"]}>{children}</RoleRoute>
    </ProtectedRoute>
  );
}

function IndustryRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={["INDUSTRY"]}>{children}</RoleRoute>
    </ProtectedRoute>
  );
}

function OpportunityViewRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={["STUDENT", "INDUSTRY"]}>{children}</RoleRoute>
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
      <Route
        path="/app/career-roadmap"
        element={
          <StudentRoute>
            <CareerRoadmapPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/assessments"
        element={
          <StudentRoute>
            <StudentAssessmentsPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/assessments/results/:attemptId"
        element={
          <StudentRoute>
            <AssessmentResultPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/assessments/:id"
        element={
          <StudentRoute>
            <AssessmentTakePage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/skill-intelligence"
        element={
          <StudentRoute>
            <SkillIntelligencePage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/opportunities"
        element={
          <StudentRoute>
            <StudentOpportunitiesPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/opportunities/:id/apply"
        element={
          <StudentRoute>
            <ApplyOpportunityPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/applications"
        element={
          <StudentRoute>
            <StudentApplicationsPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/applications/:id"
        element={
          <StudentRoute>
            <StudentApplicationDetailPage />
          </StudentRoute>
        }
      />
      <Route
        path="/app/company-profile"
        element={
          <IndustryRoute>
            <CompanyProfilePage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/opportunities/manage"
        element={
          <IndustryRoute>
            <IndustryOpportunitiesPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/opportunities/create"
        element={
          <IndustryRoute>
            <OpportunityFormPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/opportunities/:id/edit"
        element={
          <IndustryRoute>
            <OpportunityFormPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/candidates"
        element={
          <IndustryRoute>
            <IndustryCandidatesPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/opportunities/:id/applications"
        element={
          <IndustryRoute>
            <IndustryOpportunityApplicationsPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/industry/applications/:id"
        element={
          <IndustryRoute>
            <IndustryApplicationDetailPage />
          </IndustryRoute>
        }
      />
      <Route
        path="/app/opportunities/:id"
        element={
          <OpportunityViewRoute>
            <OpportunityDetailsPage />
          </OpportunityViewRoute>
        }
      />
    </Routes>
  );
}
