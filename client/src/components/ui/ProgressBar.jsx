import { cn } from "../../utils/cn.js";

export function ProgressBar({ value, label }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-text">{label}</span>
          <span className="text-secondary">{percent}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-sm bg-background">
        <div
          className={cn("h-full rounded-sm bg-primary")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
