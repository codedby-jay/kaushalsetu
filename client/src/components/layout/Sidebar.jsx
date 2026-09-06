import {
  Briefcase,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { cn } from "../../utils/cn.js";

const ROLE_LABELS = {
  STUDENT: "Student",
  INDUSTRY: "Industry",
  ACADEMICIAN: "Academician",
  INSTITUTION: "Institution",
  ADMIN: "Admin",
};

const NAV_BY_ROLE = {
  STUDENT: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { id: "profile", label: "My Profile", icon: UserRound, to: "/app/profile" },
    { id: "skills", label: "My Skills", icon: Sparkles, to: "/app/skills" },
    { id: "roadmap", label: "Career Roadmap", icon: Compass, to: "/app/career-roadmap" },
    { id: "assessments", label: "Skill Assessment", icon: ClipboardCheck, to: "/app/assessments" },
    { id: "intelligence", label: "Skill Intelligence", icon: LineChart, to: "/app/skill-intelligence" },
    { id: "opportunities", label: "Opportunities", icon: Briefcase, to: "/app/opportunities" },
    { id: "applications", label: "Applications", icon: ClipboardList },
  ],
  INDUSTRY: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { id: "company", label: "Company Profile", icon: Building2, to: "/app/company-profile" },
    { id: "opportunities", label: "My Opportunities", icon: Briefcase, to: "/app/opportunities/manage" },
    { id: "candidates", label: "Candidates", icon: Users },
  ],
  ACADEMICIAN: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { id: "faculty", label: "Faculty Opportunities", icon: Briefcase },
    { id: "research", label: "Research", icon: GraduationCap },
    { id: "consultancy", label: "Consultancy", icon: Building2 },
  ],
  INSTITUTION: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { id: "students", label: "Students", icon: Users },
    { id: "analytics", label: "Analytics", icon: LineChart },
  ],
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/app" },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: LineChart },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const items = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.STUDENT;

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Workspace
        </p>
        <p className="mt-0.5 text-sm font-medium text-text">
          {user?.name || "Account"}
        </p>
        <p className="text-xs text-secondary">
          {ROLE_LABELS[user?.role] || user?.role}
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 p-3" aria-label="Application">
        {items.map((item) => {
          const Icon = item.icon;
          if (!item.to) {
            return (
              <div
                key={item.id}
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-secondary"
                title="This module will be introduced in a later phase"
                aria-disabled="true"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm no-underline",
                  isActive
                    ? "bg-primary/8 font-medium text-primary"
                    : "text-text hover:bg-background",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <p className="mt-auto px-4 pb-4 text-[11px] leading-relaxed text-secondary">
        Greyed items are placeholders for later phases.
      </p>
    </aside>
  );
}
