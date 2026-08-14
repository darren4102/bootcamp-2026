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
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-paper-100 flex items-center justify-center px-6">
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <img src="/xyz-icon.svg" className="h-11 w-11" />
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-paper-50">XYZ Corporations</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-paper-300/60">
              Obstruction Management
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-paper-100/10 bg-ink-900/80 p-7 shadow-2xl shadow-black/40 backdrop-blur">
          <h1 className="font-display text-lg font-semibold text-paper-50">Sign in</h1>
          <p className="mt-1 text-sm text-paper-300/70">
            Access the possession &amp; obstruction request system.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-paper-300/70">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="requester or approver"
                className="w-full rounded-md border border-paper-100/15 bg-ink-950/60 px-3 py-2.5 text-sm text-paper-50 placeholder:text-paper-300/30 outline-none focus:border-signal-amber transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-paper-300/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-paper-100/15 bg-ink-950/60 px-3 py-2.5 text-sm text-paper-50 placeholder:text-paper-300/30 outline-none focus:border-signal-amber transition-colors"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-alert-rust/30 bg-alert-rust/10 px-3 py-2 text-sm text-alert-rust">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-signal-amber px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-signal-amber-dark"
            >
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-paper-100/10" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper-300/40">or</span>
            <div className="h-px flex-1 bg-paper-100/10" />
          </div>

          <button
            type="button"
            onClick={() => setSsoNotice(true)}
            className="w-full rounded-md border border-paper-100/15 bg-transparent px-4 py-2.5 text-sm font-medium text-paper-100/90 transition-colors hover:bg-paper-100/5"
          >
            Continue with Single Sign-On
          </button>
          {ssoNotice && (
            <p className="mt-2 text-center text-xs text-paper-300/50">
              SSO isn't wired up in this demo — use the credentials below instead.
            </p>
          )}

          <div className="mt-6 rounded-md border border-paper-100/10 bg-ink-950/40 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-paper-300/50">Demo credentials</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo("requester")}
                className="flex-1 rounded border border-paper-100/10 px-2 py-1.5 text-left text-xs text-paper-100/80 hover:border-signal-amber/50 hover:text-paper-50"
              >
                <span className="block font-mono text-paper-50">requester</span>
                <span className="text-paper-300/50">Requester role</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("approver")}
                className="flex-1 rounded border border-paper-100/10 px-2 py-1.5 text-left text-xs text-paper-100/80 hover:border-signal-amber/50 hover:text-paper-50"
              >
                <span className="block font-mono text-paper-50">approver</span>
                <span className="text-paper-300/50">Approver role</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
