import { cn } from "../../utils/cn.js";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "bg-surface text-text border border-border hover:bg-background focus-visible:outline-primary",
  ghost:
    "bg-transparent text-text hover:bg-background focus-visible:outline-primary",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
