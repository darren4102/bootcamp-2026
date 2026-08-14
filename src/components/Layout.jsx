import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-paper-300 bg-paper-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/xyz-icon.svg" className="h-11 w-11" />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-ink-900">XYZ Corporations</p>
              <p className="hidden font-mono text-[10px] uppercase tracking-widest text-ink-500 sm:block">
                Obstruction Management
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-ink-900 text-paper-50"
                  : "text-ink-700 hover:bg-paper-200"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/requests/new"
              className="ml-1 rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-800 transition-colors hover:bg-paper-200"
            >
              + New Request
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-ink-900">{user?.displayName}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">{user?.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-paper-50">
              {user?.displayName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
