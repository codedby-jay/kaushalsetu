import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { getApiErrorMessage } from "../services/api.js";

export function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = new URLSearchParams(location.search).get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/app", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 sm:px-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <Badge variant="primary">Secure sign in</Badge>
          <h1 className="mt-3 text-xl font-semibold text-text">Sign in</h1>
          <p className="mt-1 text-sm text-secondary">
            Use the account you created on KaushalSetu. Your role is read from
            the server, not selected here.
          </p>

          {registered ? (
            <p
              className="mt-4 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success"
              role="status"
            >
              Registration successful. Sign in to continue.
            </p>
          ) : null}

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

            {error ? (
              <p
                className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" className="mt-1 w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-secondary">
            New to KaushalSetu?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
