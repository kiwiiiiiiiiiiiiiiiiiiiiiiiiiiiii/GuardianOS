const { logger } = require('../utils/logger');

/**
 * Enforces Tenant Isolation (Zero-Trust).
 * Extracts tenant context from secure headers and prepares for RLS enforcement.
 * Mitigates LLM06: Sensitive Information Disclosure via multi-tenant data isolation.
 */
const tenantContext = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];

  // Validate UUID format for tenant_id to prevent injection into session variables
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  if (!tenantId || !uuidRegex.test(tenantId)) {
    logger.error('Missing or invalid tenant ID header', { 
      ip: req.ip, 
      userAgent: req.headers['user-agent'] 
    });
    return res.status(401).json({ 
      error: 'Tenant context required', 
      code: 'AUTH_TENANT_MISSING' 
    });
  }

  // Attach tenantId to request for downstream database pool context setting
  req.tenantId = tenantId;
  
  next();
};

module.exports = { tenantContext };