import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { cn } from "../../utils/cn.js";
import { Button } from "../ui/Button.jsx";

const ROLE_LABELS = {
  STUDENT: "Student",
  INDUSTRY: "Industry",
  ACADEMICIAN: "Academician",
  INSTITUTION: "Institution",
  ADMIN: "Admin",
};

export function Navbar({ variant = "public" }) {
  const isApp = variant === "app";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div
        className={cn(
          "flex h-14 items-center justify-between gap-4 px-4 sm:px-6",
          !isApp && "mx-auto max-w-6xl",
        )}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-white">
            K
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-text">
              KaushalSetu
            </span>
            <span className="hidden text-[11px] text-secondary sm:block">
              Academia–Industry Portal
            </span>
          </span>
        </Link>

        {isApp ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-text">
                {user?.name || "Signed in"}
              </p>
              <p className="text-[11px] text-secondary">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <nav className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background"
            >
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Get Started
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
