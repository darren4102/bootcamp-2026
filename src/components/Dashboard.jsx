import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import RequesterDashboard from "./RequesterDashboard";
import ApproverDashboard from "./ApproverDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const { requests } = useRequests();

  if (user.role === "Approver") {
    return <ApproverDashboard requests={requests} username={user.username} />;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back, {user.displayName.split(" ")[0]}</h1>
      <p className="mt-1 mb-6 text-sm text-ink-500">Track and manage your obstruction requests.</p>
      <RequesterDashboard requests={requests} username={user.username} />
    </div>
  );
}
