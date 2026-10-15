import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardShell() {
  return (
    <div className="flex min-h-dvh bg-[var(--color-background)]">
      <Sidebar />
      {/* Main area offset by sidebar width on desktop */}
      <div className="flex flex-col flex-1 md:ml-56 animate-fade-in">
        <DashboardHeader />
        <main id="main-content" className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-muted)] md:px-10">
          <span>SceneSense &mdash; ResNet50 scene classifier &bull; {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}
