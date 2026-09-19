import React, { useRef, useEffect } from 'react';
import { useAuditStream } from '../../hooks/useAuditStream';

export const AuditTerminal = () => {
  const logs = useAuditStream();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-64 bg-black p-4 font-mono text-xs overflow-y-auto rounded-lg border border-slate-800 shadow-inner">
      {logs.length === 0 && <span className="text-slate-600 italic">Waiting for telemetry stream...</span>}
      {logs.map((log, idx) => (
        <div key={idx} className={`mb-1 ${log.severity === 'CRITICAL' ? 'text-red-500' : 'text-green-400'}`}>
          <span className="opacity-50">[{log.timestamp}]</span> {log.event_type}: {JSON.stringify(log.payload)}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};