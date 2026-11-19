const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const { tenantContext } = require('./middleware/tenant.middleware');
const { sanitizeLLMInput } = require('./middleware/security.middleware');
const { logger, logThreat } = require('./utils/logger');

const app = express();

// Security Hardening: Apply Helmet for secure headers
app.use(helmet());

// Strict JSON parsing with size limits to prevent DoS
app.use(express.json({ limit: '10kb' }));

// Health Check (Public)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * AI Orchestration Route (Legacy/Full)
 * Flow: 
 * 1. Tenant Context Extraction (Isolation)
 * 2. LLM Input Sanitization (Injection Defense)
 * 3. Protected Execution (Zero-Trust)
 */
app.post('/api/v1/orchestrate', tenantContext, sanitizeLLMInput, async (req, res, next) => {
  try {
    const { sanitizedPrompt, tenantId } = req;
    
    logger.info('Processing AI Request', { 
      tenantId, 
      action: 'orchestrate',
      promptLength: sanitizedPrompt.length 
    });

    // Mock Orchestration Logic
    // In a full implementation, this would involve a DB connection that:
    // 1. Calls `SELECT set_tenant_context($1)`
    // 2. Executes the business logic within that RLS context
    
    const mockResponse = {
      tenant_id: tenantId,
      status: "success",
      output: "Document analyzed within secure tenant container.",
      audit_ref: crypto.randomUUID()
    };

    res.json(mockResponse);
  } catch (error) {
    next(error);
  }
});

/**
 * AI Agent Endpoint (Frontend Compatible)
 * Simplified endpoint for the AiOpsConsole chat interface
 */
app.post('/api/agent', tenantContext, sanitizeLLMInput, async (req, res, next) => {
  try {
    const { sanitizedPrompt, tenantId } = req;

    logger.info('Processing Agent Request', {
      tenantId,
      action: 'agent_chat',
      promptLength: sanitizedPrompt.length
    });

    // Simulate AI response
    const responses = [
      "I've analyzed your request within the secure tenant context. The operation completed successfully.",
      "Processing complete. No security violations detected in the tenant isolation layer.",
      "Request handled. Audit trail updated with reference: " + crypto.randomUUID(),
      "Analysis complete. All data remains within your tenant boundary."
    ];

    const mockResponse = {
      tenant_id: tenantId,
      status: "success",
      output: responses[Math.floor(Math.random() * responses.length)],
      audit_ref: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    next(error);
  }
});

/**
 * Security Audit Stream (SSE) - Live Telemetry
 * Provides real-time security event streaming for the SecurityAuditTerminal
 */
app.get('/api/audit-stream', tenantContext, (req, res) => {
  const { tenantId } = req;

  logger.info('SSE Connection Established', { tenantId, action: 'audit_stream_connect' });

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', tenantId, message: 'Audit stream connected', timestamp: new Date().toISOString() })}\n\n`);

  // Simulate live telemetry events
  const eventTypes = ['info', 'warning', 'threat', 'audit'];
  const eventMessages = [
    { type: 'info', message: 'Tenant context validated', details: 'Zero-trust verification passed' },
    { type: 'info', message: 'RLS policy enforced', details: 'Row-level security active for tenant' },
    { type: 'audit', message: 'API request processed', details: 'POST /api/agent - 200 OK' },
    { type: 'warning', message: 'Rate limit approached', details: '85% of threshold reached' },
    { type: 'threat', message: 'Injection attempt blocked', details: 'SQL pattern detected and rejected' },
    { type: 'audit', message: 'Data access logged', details: 'Tenant data read operation recorded' },
    { type: 'info', message: 'Security scan completed', details: 'No vulnerabilities found' },
    { type: 'audit', message: 'Session heartbeat', details: 'Tenant session active' }
  ];

  let eventCount = 0;
  const interval = setInterval(() => {
    if (eventCount >= 20) {
      clearInterval(interval);
      res.write(`data: ${JSON.stringify({ type: 'info', message: 'Demo stream ended', timestamp: new Date().toISOString() })}\n\n`);
      res.end();
      return;
    }

    const event = eventMessages[Math.floor(Math.random() * eventMessages.length)];
    const payload = {
      ...event,
      tenantId,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: event.type === 'threat' ? 'high' : event.type === 'warning' ? 'medium' : 'low'
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    eventCount++;
  }, 2000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    logger.info('SSE Connection Closed', { tenantId, action: 'audit_stream_disconnect' });
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  const errorMap = {
    'TENANT_ISOLATION_VIOLATION': { status: 403, msg: "Access Denied: Tenant isolation violation detected.", details: "Attempt to access data from another tenant's context." },
    'AUTHENTICATION_FAILED': { status: 401, msg: "Authentication Failed: Invalid or expired token.", details: "The provided authentication token is invalid." },
    'INJECTION_ATTEMPT_DETECTED': { status: 403, msg: "Security Policy Violation: Injection patterns detected.", details: "The prompt contains suspicious SQL/Command injection patterns." },
    'INSECURE_DESIGN_DETECTED': { status: 403, msg: "Security Policy Violation: Insecure design patterns detected.", details: "The prompt contains suspicious insecure design patterns (e.g. password harvesting)." },
    'SECURITY_MISCONFIGURATION_DETECTED': { status: 403, msg: "Security Policy Violation: Security misconfiguration patterns detected.", details: "The prompt contains suspicious configuration access patterns." },
    'VULNERABLE_COMPONENTS_DETECTED': { status: 403, msg: "Security Policy Violation: Vulnerable and outdated components patterns detected.", details: "Exploitation attempt of known vulnerabilities." },
    'IDENTIFICATION_AUTHENTICATION_FAILURES_DETECTED': { status: 403, msg: "Security Policy Violation: Identification and authentication failures patterns detected.", details: "Credential theft or authentication bypass attempt." },
    'SOFTWARE_DATA_INTEGRITY_FAILURES_DETECTED': { status: 403, msg: "Security Policy Violation: Software and data integrity failures patterns detected.", details: "Data tampering or unauthorized modification attempt." },
    'SECURITY_LOGGING_MONITORING_FAILURES_DETECTED': { status: 403, msg: "Security Policy Violation: Security logging and monitoring failures patterns detected.", details: "Audit bypass or log tampering attempt." },
    'SERVER_SIDE_REQUEST_FORGERY_DETECTED': { status: 403, msg: "Security Policy Violation: Server-side request forgery patterns detected.", details: "The prompt contains suspicious internal network access patterns." },
    'LLM_INJECTION_GUARD': { status: 403, msg: "Security Policy Violation: Prompt Injection detected.", details: "Adversarial instruction patterns found." }
  };

  const errorResponse = errorMap[errorCode];

  if (errorResponse) {
    logger.warn('Security Rejection', { code: errorCode, tenantId: req.tenantId, path: req.path });
    return res.status(errorResponse.status).json({
      error: errorResponse.msg,
      code: errorCode,
      details: errorResponse.details
    });
  }

  logger.error('Unhandled Exception in GuardianOS Core', {
    error: err.message,
    path: req.path
  });
  res.status(500).json({ error: 'Critical system error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`GuardianOS Core Engine running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;