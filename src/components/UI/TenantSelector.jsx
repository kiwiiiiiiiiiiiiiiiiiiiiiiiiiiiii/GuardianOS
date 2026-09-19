import React from 'react';
import { useTenant } from '../../context/TenantContext';

export const TenantSelector = () => {
  const { tenantId, setTenantId } = useTenant();

  return (
    <select 
      value={tenantId}
      onChange={(e) => setTenantId(e.target.value)}
      className="bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="550e8400-e29b-41d4-a716-446655440000">Enterprise A (Production)</option>
      <option value="660e8400-e29b-41d4-a716-446655440001">Enterprise B (Staging)</option>
    </select>
  );
};