import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { getApiErrorMessage } from "../services/api.js";
import { cn } from "../utils/cn.js";

const roles = [
  { id: "STUDENT", label: "Student" },
  { id: "INDUSTRY", label: "Industry" },
  { id: "ACADEMICIAN", label: "Academician" },
  { id: "INSTITUTION", label: "Institution" },
];

export function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      await register({ name, email, password, role });
      navigate("/app", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 sm:px-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <Badge variant="primary">Create account</Badge>
          <h1 className="mt-3 text-xl font-semibold text-text">Register</h1>
          <p className="mt-1 text-sm text-secondary">
            Join as a student, industry partner, academician, or institution.
            Administrator accounts are not created here.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              id="name"
              label="Full name"
              autoComplete="name"
              placeholder="Jay Prajapati"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="name@institution.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-text">Role</legend>
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
            </fieldset>

            {error ? (
              <p
                className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-secondary">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
