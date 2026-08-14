import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ssoNotice, setSsoNotice] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter both a username and password.");
      return;
    }
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  function fillDemo(role) {
    setUsername(role);
    setPassword("password");
    setError("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper-100 text-ink-900 flex items-center justify-center px-6">
      {/* rail-line backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.4]">
        <div className="absolute left-0 right-0 top-1/3 h-px bg-paper-300" />
        <div className="absolute left-0 right-0 top-1/3 mt-3 h-px bg-paper-300" />
        <div className="absolute left-0 right-0 bottom-1/4 h-px bg-paper-300" />
        <div className="absolute left-0 right-0 bottom-1/4 mt-3 h-px bg-paper-300" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-900 text-signal-amber font-display font-bold text-lg">
            TH
          </div>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-ink-900">TrackHold</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-500">
              Obstruction Management
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-paper-300 bg-paper-50 p-7 shadow-xl shadow-ink-900/5">
          <h1 className="font-display text-lg font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">
            Access the possession &amp; obstruction request system.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="requester or approver"
                className="w-full rounded-md border border-paper-300 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/40 outline-none focus:border-signal-amber transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-paper-300 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/40 outline-none focus:border-signal-amber transition-colors"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-alert-rust/30 bg-alert-rust/10 px-3 py-2 text-sm text-alert-rust-dark">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800"
            >
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-paper-300" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500/60">or</span>
            <div className="h-px flex-1 bg-paper-300" />
          </div>

          <button
            type="button"
            onClick={() => setSsoNotice(true)}
            className="w-full rounded-md border border-paper-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:bg-paper-200"
          >
            Continue with Single Sign-On
          </button>
          {ssoNotice && (
            <p className="mt-2 text-center text-xs text-ink-500">
              SSO isn't wired up in this demo — use the credentials below instead.
            </p>
          )}

          <div className="mt-6 rounded-md border border-paper-300 bg-paper-100 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Demo credentials</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo("requester")}
                className="flex-1 rounded border border-paper-300 bg-white px-2 py-1.5 text-left text-xs text-ink-700 hover:border-signal-amber/60 hover:text-ink-900"
              >
                <span className="block font-mono text-ink-900">requester</span>
                <span className="text-ink-500">Requester role</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("approver")}
                className="flex-1 rounded border border-paper-300 bg-white px-2 py-1.5 text-left text-xs text-ink-700 hover:border-signal-amber/60 hover:text-ink-900"
              >
                <span className="block font-mono text-ink-900">approver</span>
                <span className="text-ink-500">Approver role</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
