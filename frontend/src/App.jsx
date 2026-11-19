import React from 'react';
import { TenantProvider } from './context/TenantContext';
import MasterDashboardLayout from './components/MasterDashboardLayout';

export default function App() {
  return (
    <TenantProvider>
      <MasterDashboardLayout />
    </TenantProvider>
  );
}

