import React from 'react';
import { TenantSelector } from '../UI/TenantSelector';
import { AuditTerminal } from '../UI/AuditTerminal';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900">
        <h1 className="text-xl font-bold text-blue-500">GuardianOS Control Center</h1>
        <TenantSelector />
      </header>
      
      <main className="p-6">
        {children}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Security Telemetry</h2>
          <AuditTerminal />
        </section>
      </main>
    </div>
  );
};