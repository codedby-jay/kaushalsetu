import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="app" />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
