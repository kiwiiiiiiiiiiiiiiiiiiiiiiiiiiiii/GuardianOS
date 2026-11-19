import React, { createContext, useContext, useState } from 'react';


const TenantContext = createContext(null);

export const tenants = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Alpha Corp (Enterprise)', tier: 'Tier-1 High Security', region: 'us-east-1' },
  { id: '111e8400-e29b-41d4-a716-446655440111', name: 'Beta Industries (Fintech)', tier: 'Tier-2 Zero-Trust', region: 'eu-west-1' },
  { id: '222e8400-e29b-41d4-a716-446655440222', name: 'Omega Global (GovOps)', tier: 'Tier-1 Classified', region: 'us-gov-west-1' }
];

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(tenants[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, ai-console, audit-terminal, security-matrix

  const switchTenant = (tenantId) => {
    const found = tenants.find(t => t.id === tenantId);
    if (found) {
      setCurrentTenant(found);
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, tenants, switchTenant, activeTab, setActiveTab }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};