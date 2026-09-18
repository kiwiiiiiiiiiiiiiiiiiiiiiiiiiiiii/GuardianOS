const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'guardian-os-gateway' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

/**
 * Logs security violations to both console and (hypothetically) the audit_logs table.
 * Critical for compliance and forensic analysis.
 */
const logThreat = (tenantId, violationType, details) => {
  logger.warn('SECURITY_VIOLATION_DETECTED', {
    tenantId,
    violationType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = { logger, logThreat };