import React from 'react';
import ReactDOM from 'react-dom/client';
import { TenantProvider } from './context/TenantContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TenantProvider>
      <DashboardLayout>
        <div className="p-6 bg-slate-900 text-slate-100 h-full w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome to GuardianOS Control Center</h2>
          <p className="text-slate-400">This is the unified dashboard. Use the navigation or tenant selector to access AI Operations, Knowledge Base, or Audit Terminal.</p>
        </div>
      </DashboardLayout>
    </TenantProvider>
  </React.StrictMode>
);