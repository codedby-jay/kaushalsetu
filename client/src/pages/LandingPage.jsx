import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Landmark,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { fetchHealth } from "../services/api.js";

const audiences = [
  {
    title: "Students",
    description:
      "Build a verified skill profile, see where you have gaps, and discover internships and jobs that actually fit.",
    icon: Users,
  },
  {
    title: "Industries",
    description:
      "Publish opportunities with required skills and proficiency levels, then review candidates ranked by compatibility.",
    icon: Building2,
  },
  {
    title: "Academicians",
    description:
      "Discover faculty internships, industrial training, FDPs, consultancy, and research collaboration.",
    icon: GraduationCap,
  },
  {
    title: "Institutions",
    description:
      "Monitor skill gaps, internship participation, and placement readiness across departments and batches.",
    icon: Landmark,
  },
];

const journey = [
  "Skill Assessment",
  "Skill Profile",
  "Skill Gap",
  "Opportunity Match",
  "Application",
  "Career Outcome",
];

export function LandingPage() {
  const [health, setHealth] = useState({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (!cancelled) {
          setHealth({ state: "ok", data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({ state: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PublicLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Badge variant="primary">Smart India Hackathon 2026</Badge>
          <h1 className="mt-4 max-w-2xl text-[32px] font-semibold leading-tight tracking-tight text-text sm:text-[36px]">
            KaushalSetu
          </h1>
          <p className="mt-2 text-lg text-primary">
            Bridging Skills, Academia &amp; Industry
          </p>
          <p className="mt-4 max-w-2xl text-[15px] text-secondary">
            A collaboration portal that helps students understand industry skill
            demand, close gaps with targeted learning, and match to internships
            and jobs using an explainable compatibility score — not a black box.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="secondary">
                View application shell
              </Button>
            </Link>
          </div>
          <ApiStatus health={health} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-semibold text-text">Who it serves</h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          One platform for the four stakeholders named in the problem statement.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-secondary">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold text-text">Core journey</h2>
          <p className="mt-1 text-sm text-secondary">
            From assessment to placement, each step is designed to be demonstrable
            and explainable.
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {journey.map((step, index) => (
              <li
                key={step}
                className="relative rounded-md border border-border bg-background px-3 py-3"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Step {index + 1}
                </span>
                <p className="mt-1 text-sm font-medium text-text">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <Badge variant="primary">Core USP</Badge>
            <h2 className="mt-3 text-xl font-semibold text-text">
              Explainable skill matching
            </h2>
            <p className="mt-3 text-sm text-secondary">
              Opportunities are ranked by comparing a student’s proficiency (0–10)
              against each required skill. Full credit is given when the student
              meets or exceeds the requirement; otherwise the score is proportional.
              The result is a match percentage, matched skills, and explicit gaps —
              without AI or embeddings in the MVP.
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-secondary">
              <li>Student skills + industry requirements</li>
              <li>Compatibility score you can show a jury</li>
              <li>Skill gaps with current vs required proficiency</li>
            </ul>
          </div>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Example calculation (illustrative only)
            </p>
            <p className="mt-2 text-sm text-secondary">
              If React requires 7 and the student has 8, that skill earns full
              points. If DSA requires 5 and the student has 4, that skill earns
              4/5 of the points. The match percentage is earned points divided by
              total possible points.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-secondary">
                    <th className="py-2 pr-3 font-medium">Skill</th>
                    <th className="py-2 pr-3 font-medium">Student</th>
                    <th className="py-2 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody className="text-text">
                  <tr className="border-b border-border">
                    <td className="py-2 pr-3">React</td>
                    <td className="py-2 pr-3">8</td>
                    <td className="py-2">7</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-3">Node.js</td>
                    <td className="py-2 pr-3">7</td>
                    <td className="py-2">6</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">DSA</td>
                    <td className="py-2 pr-3">4</td>
                    <td className="py-2">5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

function ApiStatus({ health }) {
  if (health.state === "loading") {
    return (
      <p className="mt-6 text-xs text-secondary">Checking API status…</p>
    );
  }

  if (health.state === "error") {
    return (
      <p className="mt-6 text-xs text-secondary">
        API status: unreachable (start the Express server on port 5000 to verify{" "}
        <code className="text-text">GET /api/health</code>).
      </p>
    );
  }

  const database = health.data?.database === "up" ? "up" : "down";

  return (
    <p className="mt-6 text-xs text-secondary">
      API status: {health.data?.status || "ok"} · service{" "}
      {health.data?.service || "kaushalsetu-api"} · database {database}
    </p>
  );
}
