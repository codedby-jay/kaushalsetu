import { Badge } from "./Badge.jsx";
import { cn } from "../../utils/cn.js";

const BAND_VARIANT = {
  EXCELLENT: "success",
  GOOD: "primary",
  PARTIAL: "warning",
  LOW: "danger",
};

export function MatchScore({ match, className }) {
  if (!match?.available) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <p className="text-lg font-semibold tabular-nums text-text">
        {match.matchPercentage}%
      </p>
      <Badge variant={BAND_VARIANT[match.band] || "default"}>{match.label}</Badge>
    </div>
  );
}

export function SkillMatchRow({ item }) {
  const met = item.status === "MATCHED";
  const partial = item.status === "PARTIAL";
  const mark = met ? "✓" : partial ? "△" : "!";
  const tone = met ? "text-success" : partial ? "text-warning" : "text-danger";
  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <span className={tone}>
        {mark} {item.skill}
      </span>
      <span className="shrink-0 text-secondary">
        {item.currentProficiency}/10 → required {item.requiredProficiency}/10
        {!item.isRequired ? " · optional" : ""}
      </span>
    </li>
  );
}
