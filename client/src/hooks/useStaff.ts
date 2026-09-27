import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import type { StaffMember } from "../types/request";

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/staff");
      setStaff(response.data.data);
    } catch {
      setError("Failed to load staff.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { staff, loading, error, reload: load };
};