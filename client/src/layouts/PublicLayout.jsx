import { Navbar } from "../components/layout/Navbar.jsx";

export function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="public" />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-secondary">
            KaushalSetu · Smart India Hackathon 2026
          </p>
          <p className="text-sm text-secondary">
            Academia–Industry Collaboration Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
