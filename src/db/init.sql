-- GuardianOS: Multi-Tenant Database Schema with Row-Level Security
-- Enable RLS and audit logging

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    api_key_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Audit Logs Table (Global)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'LLM_PROMPT', 'SECURITY_VIOLATION', 'TOOL_EXECUTION'
    severity TEXT CHECK (severity IN ('INFO', 'WARN', 'CRITICAL')),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Example Domain Table: Business Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies
-- Use a session variable 'app.current_tenant' to filter records
CREATE POLICY tenant_isolation_policy ON documents
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_policy ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- 6. Helper Function to Switch Tenant Context
CREATE OR REPLACE FUNCTION set_tenant_context(t_id UUID) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant', t_id::text, false);
END;
$$ LANGUAGE plpgsql;