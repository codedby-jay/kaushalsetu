import {
  Briefcase,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "../../utils/cn.js";

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, available: true },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, available: false },
  { id: "applications", label: "Applications", icon: ClipboardList, available: false },
  { id: "skills", label: "Skills", icon: Sparkles, available: false },
  { id: "learning", label: "Learning", icon: GraduationCap, available: false },
  { id: "portfolio", label: "Portfolio", icon: UserRound, available: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Workspace
        </p>
        <p className="mt-0.5 text-sm font-medium text-text">Student view</p>
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
        Navigation items besides Dashboard are placeholders until later phases.
      </p>
    </aside>
  );
}
