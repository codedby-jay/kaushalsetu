import {
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
    { id: "skills", label: "My Skills", icon: Sparkles, available: false },
    { id: "opportunities", label: "Opportunities", icon: Briefcase, available: false },
    { id: "applications", label: "Applications", icon: ClipboardList, available: false },
  ],
  INDUSTRY: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
    { id: "opportunities", label: "Opportunities", icon: Briefcase, available: false },
    { id: "candidates", label: "Candidates", icon: Users, available: false },
  ],
  ACADEMICIAN: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
    { id: "faculty", label: "Faculty Opportunities", icon: Briefcase, available: false },
    { id: "research", label: "Research", icon: GraduationCap, available: false },
    { id: "consultancy", label: "Consultancy", icon: Building2, available: false },
  ],
  INSTITUTION: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
    { id: "students", label: "Students", icon: Users, available: false },
    { id: "analytics", label: "Analytics", icon: LineChart, available: false },
  ],
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
    { id: "users", label: "Users", icon: Users, available: false },
    { id: "analytics", label: "Analytics", icon: LineChart, available: false },
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
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                item.available
                  ? "bg-primary/8 font-medium text-primary"
                  : "cursor-not-allowed text-secondary",
              )}
              title={
                item.available
                  ? undefined
                  : "This module will be introduced in a later phase"
              }
              aria-current={item.available ? "page" : undefined}
              aria-disabled={!item.available}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <p className="mt-auto px-4 pb-4 text-[11px] leading-relaxed text-secondary">
        Navigation besides Dashboard is a placeholder until later phases.
      </p>
    </aside>
  );
}
