import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';
import { Terminal, Shield, Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

export default function SecurityAuditTerminal() {
  const { currentTenant } = useTenant();
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    setEvents([
      {
        eventId: 'sys-init',
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: `Initializing SSE telemetry stream for tenant ${currentTenant.name}`,
        details: `Tenant UUID: ${currentTenant.id}`,
        severity: 'low'
      }
    ]);

    let eventSource = null;

    const connectStream = () => {
      // Note: EventSource doesn't support custom headers directly in browser standard API,
      // but in our gateway we can pass tenantId via query param or use fetch reader.
      // For standard SSE with custom headers, fetch() stream reader is robust:
      let isCancelled = false;

      const startFetchStream = async () => {
        try {
          const response = await fetch('/api/audit-stream', {
            headers: {
              'x-tenant-id': currentTenant.id
            }
          });

          if (!response.ok) {
            throw new Error('Failed to establish audit stream');
          }

          setIsConnected(true);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (!isCancelled) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // keep incomplete chunk

            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const jsonStr = line.replace('data:', '').trim();
                  const parsed = JSON.parse(jsonStr);
                  setEvents(prev => [parsed, ...prev].slice(0, 100)); // keep last 100
                } catch (e) {
                  // ignore parse error on keep-alive
                }
              }
            }
          }
        } catch (err) {
          setIsConnected(false);
          if (!isCancelled) {
            setTimeout(connectStream, 3000);
          }
        }
      };

      startFetchStream();

      return () => {
        isCancelled = true;
        setIsConnected(false);
      };
    };

    const cleanup = connectStream();

    return () => {
      cleanup && cleanup();
    };
  }, [currentTenant]);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const clearLogs = () => setEvents([]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-white font-semibold text-sm">Live Security Audit & Telemetry Stream</h2>
            <p className="text-xs text-slate-400">Tenant Boundary: <span className="text-cyan-400 font-mono">{currentTenant.name}</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Badge */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${
            isConnected 
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            {isConnected ? (
              <><Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /><span>SSE Live Stream Connected</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-rose-400" /><span>Reconnecting Stream...</span></>
            )}
          </div>

          <button
            onClick={clearLogs}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Stream</span>
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-xs space-y-2.5"
      >
        {events.map((ev, index) => {
          const isThreat = ev.type === 'threat' || ev.severity === 'high';
          const isWarning = ev.type === 'warning' || ev.severity === 'medium';
          
          return (
            <div 
              key={ev.eventId || index} 
              className={`p-3 rounded-lg border flex items-start justify-between ${
                isThreat 
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  : ev.type === 'audit'
                  ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-slate-500 shrink-0 select-none">[{ev.timestamp || new Date().toLocaleTimeString()}]</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                      isThreat ? 'bg-rose-900 text-white' : isWarning ? 'bg-amber-900 text-white' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      {ev.type || 'EVENT'}
                    </span>
                    <span className="font-semibold text-white">{ev.message}</span>
                  </div>
                  {ev.details && <p className="text-slate-400 mt-1 text-[11px]">{ev.details}</p>}
                  {ev.tenantId && <div className="text-[10px] text-slate-500 mt-1">Tenant ID: {ev.tenantId}</div>}
                </div>
              </div>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                isThreat ? 'text-rose-400 bg-rose-950 border border-rose-800' : 'text-slate-400 bg-slate-900'
              }`}>
                {ev.severity || 'low'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Total Events Captured: <strong className="text-white font-mono">{events.length}</strong></span>
          <span>Row-Level Security: <strong className="text-emerald-400">Enforced</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>SIEM Integration Active</span>
        </div>
      </div>
    </div>
  );
}