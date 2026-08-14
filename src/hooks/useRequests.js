import { useEffect, useState, useCallback } from "react";
import { getAllRequests } from "../utils/storage";

// Re-reads from localStorage whenever any part of the app writes to it,
// so every dashboard/list stays in sync without prop drilling a store.
export function useRequests() {
  const [requests, setRequests] = useState(() => getAllRequests());

  const refresh = useCallback(() => {
    setRequests(getAllRequests());
  }, []);

  useEffect(() => {
    window.addEventListener("obstructionRequestsChanged", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("obstructionRequestsChanged", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { requests, refresh };
}
