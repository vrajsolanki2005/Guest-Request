import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import type { RequestItem } from "../types/request";

export const useRequests = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await api.get("/requests");
      setRequests(response.data.data);
    } catch {
      // silently fail — UI shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { requests, loading, reload: load };
};
