import { cn } from "../../utils/cn.js";

export function Textarea({
  id,
  label,
  error,
  hint,
  className,
  rows = 4,
  ...props
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        className={cn(
          "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text",
          "placeholder:text-secondary",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-secondary">{hint}</p> : null}
    </div>
  );
}
