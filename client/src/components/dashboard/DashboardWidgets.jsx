import { cn } from "../../utils/cn.js";

export function MetricCard({ label, value, hint, className }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-text">{value}</p>
      {hint ? <p className="mt-1 text-xs text-secondary">{hint}</p> : null}
    </div>
  );
}

export function CssBar({ value, max = 100, className }) {
  const percent = max <= 0 ? 0 : Math.max(0, Math.min(100, (Number(value) || 0) / max * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-sm bg-background", className)}>
      <div className="h-full rounded-sm bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function LabeledBar({ label, value, max = 100, suffix = "" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="shrink-0 tabular-nums text-secondary">
          {value}
          {suffix}
        </span>
      </div>
      <CssBar value={value} max={max} />
    </div>
  );
}

export function DashboardSection({ title, description, children, action, className }) {
  return (
    <section
      className={cn(
        "rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {description ? <p className="mt-1 text-sm text-secondary">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
