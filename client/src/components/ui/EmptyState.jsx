import { Inbox } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background">
        <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
