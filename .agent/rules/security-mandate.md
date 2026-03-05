---
trigger: always_on
description: Security guidelines for the client-side Akvo RAG widget.
---

# Security Mandate

The widget runs in the user's browser; therefore, security is paramount.

## 1. Credential Management
- **NEVER** hardcode sensitive API keys or secrets in the client-side code.
- Use environment-specific tokens that are limited in scope.
- Prefer authentication handled by the Akvo RAG backend service.

## 2. Content Security Policy (CSP)
- Be aware of the host site's CSP. The widget should not require `unsafe-inline` or `unsafe-eval`.
- Use `lib/dompurify` for all dynamic content insertion.

## 3. Data Privacy
- Do not log PII (Personally Identifiable Information) in client-side console logs.
- Ensure all communication with the RAG backend is over HTTPS.

## 4. Input Sanitization
- Sanitize user input before sending it to the backend to prevent injection attacks.
