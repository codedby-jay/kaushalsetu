import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { cn } from "../utils/cn.js";

const roles = [
  { id: "STUDENT", label: "Student" },
  { id: "INDUSTRY", label: "Industry" },
  { id: "ACADEMICIAN", label: "Academician" },
  { id: "INSTITUTION", label: "Institution" },
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setNotice(
      "Sign-in is a UI placeholder in Phase 1. Authentication, JWT, and role-based access will be connected in Phase 2. No credentials were sent or stored.",
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 sm:px-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <Badge variant="default">Phase 1 placeholder</Badge>
          <h1 className="mt-3 text-xl font-semibold text-text">Sign in</h1>
          <p className="mt-1 text-sm text-secondary">
            This screen establishes the login layout. It does not authenticate
            users yet.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="name@institution.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-text">
                Role
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-left text-sm",
                      role === item.id
                        ? "border-primary bg-primary/8 font-medium text-primary"
                        : "border-border bg-surface text-secondary hover:bg-background",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-secondary">
                Role selection is visual only. The server will enforce roles in
                Phase 2.
              </p>
            </fieldset>

            <Button type="submit" className="mt-1 w-full">
              Continue
            </Button>
          </form>

          {notice ? (
            <p
              className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm text-secondary"
              role="status"
            >
              {notice}
            </p>
          ) : null}

          <p className="mt-5 text-sm text-secondary">
            Preview the shell?{" "}
            <Link to="/app" className="font-medium text-primary hover:underline">
              Open application layout
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
