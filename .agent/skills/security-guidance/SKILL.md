---
name: security-guidance
description: Proactive security audit checklists and vulnerability prevention rules. Use when writing authentication, authorization, database queries, file uploads, external API integrations, or performing security audits.
---

# Security Guidance & Vulnerability Prevention

A comprehensive, production-grade security guide providing direct **Insecure vs. Secure** code patterns and checklists across the most critical vulnerability classes.

---

## 🛡️ Critical Vulnerability Classes & Code Patterns

### 1. SQL Injection & Database Safety

* ❌ **INSECURE (String Concatenation / Interpolation)**:
  ```python
  # Vulnerable to SQL injection
  cursor.execute(f"SELECT * FROM users WHERE email = '{user_email}' AND status = 'active'")
  ```
* ✅ **SECURE (Parameterized Queries / ORM Binding)**:
  ```python
  # Safe parameterized execution
  cursor.execute(
      "SELECT * FROM users WHERE email = %s AND status = %s",
      (user_email, "active")
  )
  ```

---

### 2. Broken Object-Level Authorization (IDOR)

* ❌ **INSECURE (Direct ID Lookup Without Tenant/Owner Check)**:
  ```typescript
  // Vulnerable to IDOR: Any user can fetch any invoice by changing the ID
  app.get('/api/invoices/:id', async (req, res) => {
    const invoice = await db.invoices.findById(req.params.id);
    return res.json(invoice);
  });
  ```
* ✅ **SECURE (Scoped Tenant Query)**:
  ```typescript
  // Secure: Scoped to authenticated user's organization
  app.get('/api/invoices/:id', authenticateToken, async (req, res) => {
    const invoice = await db.invoices.findOne({
      where: {
        id: req.params.id,
        orgId: req.user.orgId // Enforce ownership boundary
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    return res.json(invoice);
  });
  ```

---

### 3. Cross-Site Scripting (XSS) & Content Security Policy

* ❌ **INSECURE (Raw HTML Injection)**:
  ```javascript
  // Vulnerable to stored/reflected XSS
  element.innerHTML = `<div class="user-bio">${userSuppliedBio}</div>`;
  ```
* ✅ **SECURE (DOM Text Node / Sanitized Rendering)**:
  ```javascript
  // Safe textContent or sanitized DOMPurify
  element.textContent = userSuppliedBio;
  // Or in React/Vue: use standard JSX `{userSuppliedBio}` which escapes by default
  ```
* **Strict CSP Header**:
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; object-src 'none'; frame-ancestors 'none';
  ```

---

### 4. Server-Side Request Forgery (SSRF)

* ❌ **INSECURE (Blind Fetching of User-Supplied URLs)**:
  ```python
  # Vulnerable to SSRF: Attacker passes 'http://169.254.169.254/latest/meta-data/'
  response = requests.get(user_webhook_url)
  ```
* ✅ **SECURE (URL Scheme & IP Address Whitelisting)**:
  ```python
  import ipaddress, socket, urllib.parse

  def validate_safe_webhook(url: str):
      parsed = urllib.parse.urlparse(url)
      if parsed.scheme not in ("http", "https"):
          raise ValueError("Invalid URL scheme")
      hostname = parsed.hostname
      ip = ipaddress.ip_address(socket.gethostbyname(hostname))
      if ip.is_private or ip.is_loopback or ip.is_link_local:
          raise ValueError("Access to internal/private IP addresses is blocked")
  ```

---

### 5. Timing Attack Prevention on Hashes & Tokens

* ❌ **INSECURE (Standard Equality Operator)**:
  ```javascript
  // Vulnerable to timing attack leaks
  if (userProvidedToken === secretApiKey) { ... }
  ```
* ✅ **SECURE (Constant-Time Safe Comparison)**:
  ```javascript
  import crypto from 'node:crypto';
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(userProvidedToken, 'utf8'),
    Buffer.from(secretApiKey, 'utf8')
  );
  ```

---

### 6. Secrets & Environment Hygiene

- **Zero Hardcoded Secrets**: Prohibit committing API keys, private keys, JWT secrets, or DB credentials.
- **Environment Separation**: Always load configuration via validated schema (e.g. `pydantic-settings` or `dotenv` + Zod).
- **Log Sanitization**: Ensure logging interceptors mask `password`, `token`, `authorization`, `credit_card`, and `secret`.
