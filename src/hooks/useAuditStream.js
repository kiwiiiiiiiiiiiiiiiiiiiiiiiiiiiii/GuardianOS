import { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

export const useAuditStream = () => {
  const { tenantId } = useTenant();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs([]);
    const eventSource = new EventSource(`/api/audit-stream?tenant_id=${tenantId}`);

    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs((prev) => [...prev.slice(-99), newLog]);
    };

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [tenantId]);

  return logs;
};