import { cn } from "../../utils/cn.js";

export function Card({ children, className, as: Component = "div", ...props }) {
  return (
    <Component
      className={cn(
        "rounded-md border border-border bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
