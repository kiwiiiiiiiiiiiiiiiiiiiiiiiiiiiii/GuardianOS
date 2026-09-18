const { logThreat } = require('../utils/logger');

/**
 * Sanitizes LLM Input and detects Prompt Injection attempts.
 * Implements Defense-in-Depth for OWASP LLM01 (Prompt Injection).
 */
const sanitizeLLMInput = (req, res, next) => {
  const { prompt } = req.body;
  const tenantId = req.tenantId || 'anonymous';

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt format: String expected.' });
  }

  // 1. Length Constraints (Model Denial of Service Mitigation - LLM10)
  if (prompt.length > 4000) {
    logThreat(tenantId, 'PROMPT_TOO_LONG', { length: prompt.length });
    return res.status(413).json({ error: 'Prompt exceeds maximum allowed length of 4000 characters.' });
  }

  // 2. Comprehensive Security Pattern Detection (OWASP Top 10 Mitigation)
  const detections = [
    {
      pattern: /SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR 1=1/gi,
      code: 'INJECTION_ATTEMPT_DETECTED'
    },
    {
      pattern: /password|credential|secret|private key/gi,
      code: 'INSECURE_DESIGN_DETECTED'
    },
    {
      pattern: /config|environment|env|settings|outdated/gi,
      code: 'SECURITY_MISCONFIGURATION_DETECTED'
    },
    {
      pattern: /tenant [0-9a-fA-F-]{36}/gi,
      code: 'TENANT_ISOLATION_VIOLATION'
    },
    {
      pattern: /localhost|127\.0\.0\.1|internal|http:\/\//gi,
      code: 'SERVER_SIDE_REQUEST_FORGERY_DETECTED'
    },
    {
      pattern: /ignore previous instructions|system override/gi,
      code: 'LLM_INJECTION_GUARD'
    }
  ];

  for (const det of detections) {
    if (det.pattern.test(prompt)) {
      logThreat(tenantId, det.code, { promptSnippet: prompt.substring(0, 100) });

      // We throw an error object that the app.js catch block will identify
      const error = new Error(`Security Policy Violation: ${det.code}`);
      error.code = det.code;
      return next(error);
    }
  }

  // 3. Structural Sanitization
  // Ensure no unintended control characters or escape sequences are passed to the orchestrator
  req.sanitizedPrompt = prompt.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  next();
};

module.exports = { sanitizeLLMInput };