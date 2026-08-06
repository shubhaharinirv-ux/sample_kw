import { useState, useEffect } from "react";
import { SystemLog, fetchSystemLogs } from "../api/systemLogs.api";

export const useSystemLogs = (search: string) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: NodeJS.Timeout;

    const load = async () => {
      try {
        const data = await fetchSystemLogs(search);
        if (active) {
          setLogs(data);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
            setError(err.message || "Failed to load logs");
            console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
      
      if (active) {
        timeoutId = setTimeout(load, 5000); 
      }
    };

    setLoading(true);
    load();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [search]);

  return { logs, loading, error };
};
