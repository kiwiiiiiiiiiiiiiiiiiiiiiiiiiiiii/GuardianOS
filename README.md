# GuardianOS

GuardianOS is a secure, multi-tenant AI operations engine designed with a "Security-First" architecture. It provides a robust gateway for AI orchestration, featuring built-in defenses against the OWASP LLM Top 10 vulnerabilities.

## 🛡️ Security Features
GuardianOS implements defense-in-depth strategies to secure your AI infrastructure:
*   **Multi-Tenant Isolation**: Row-Level Security (RLS) enforcement at the database layer.
*   **Prompt Sanitization**: Real-time detection of prompt injection and adversarial instructions.
*   **OWASP Mitigation**: Specific error handling and blocking for:
    *   Broken Access Control (BOLA)
    *   Injection (SQL/Command)
    *   Insecure Design & SSRF Protection
    *   Security Misconfigurations
*   **Zero-Trust Gateway**: Enforces strict `tenant_id` context validation for every API call.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL (for RLS enforcement)
*   npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/GuardianOS.git
   cd GuardianOS
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## 🧪 Testing the Security Guardrails
You can verify the security implementation using `curl`. 

**Test Case: SQL Injection Detection**
```cmd
curl -X POST http://localhost:3000/api/v1/orchestrate ^
     -H "Content-Type: application/json" ^
     -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" ^
     -d "{\"prompt\": \"DROP TABLE users;--\"}"
```

## 🏗️ Architecture
- **Engine**: Express.js with `helmet` for secure HTTP headers.
- **Security Middleware**: Intercepts and validates all incoming requests against a signature-based detection loop.
- **Audit Logging**: Structured JSON logging via `winston` for SIEM integration.

## 🤝 Contributing
GuardianOS is a secure-by-design framework. We welcome contributions that improve our defense mechanisms. Please open an issue before submitting a PR.

## 📜 License
MIT
