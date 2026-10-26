# Security Guide for Custom Tools

Comprehensive security considerations for Custom Tools development.

## Table of Contents

1. [Threat Model](#threat-model)
2. [Attack Vectors](#attack-vectors)
3. [Defense-in-Depth](#defense-in-depth)
4. [Security Checklist](#security-checklist)
5. [Incident Response](#incident-response)

## Threat Model

Custom Tools have **auto-approve** status when the feature is enabled. This means:

- Tools execute without user confirmation
- Tools run with the same permissions as Roo Code (file system, network, exec)
- Any malicious or buggy tool can cause immediate harm

**Trust Boundaries:**

1. **Code Trust**: Only load tools from trusted sources
2. **Input Trust**: User-provided parameters are untrusted — treat as hostile
3. **Output Trust**: Tool output may be used in subsequent operations (sanitize if re-parsing)

## Attack Vectors

### 1. SSRF (Server-Side Request Forgery)

**Risk:** Attacker makes your tool send requests to internal services (localhost, 169.254.169.254, etc.).

**Example Attack:**
```
{
  "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin"
}
```

**Defense:**
```javascript
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Allow only HTTPS
    if (parsed.protocol !== 'https:') return false;
    // Whitelist hosts
    const allowed = ['api.example.com', 'github.com'];
    return allowed.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}

async execute({ url }) {
  if (!isValidUrl(url)) {
    return 'Error: URL not in whitelist';
  }
  // Safe to fetch
}
```

**Additional protections:**
- Use `AbortSignal.timeout(30000)` to prevent long delays
- Block private IP ranges: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- Avoid `http://` entirely (use HTTPS only)

### 2. Command Injection

**Risk:** Attacker injects shell commands via parameters.

**Example Attack:**
```
{
  "filename": "file.txt; rm -rf /"
}
```

**Unsafe code:**
```javascript
// ❌ DANGEROUS
exec(`cat ${params.filename}`);
```

**Defense:**
```javascript
// ✅ SAFE - array args
exec('cat', [params.filename]);

// ✅ SAFER - whitelist
const ALLOWED_FILES = ['file.txt', 'config.json'];
if (!ALLOWED_FILES.includes(params.filename)) {
  return 'Error: File not allowed';
}
```

**For complex commands:**
```javascript
const { spawn } = require('child_process');
const child = spawn('git', ['commit', '-m', userMessage], {
  stdio: 'inherit',
  shell: false // NEVER use shell:true with untrusted input
});
```

### 3. Path Traversal

**Risk:** Attacker reads/writes files outside intended directories.

**Example Attack:**
```
{
  "filePath": "../../../etc/passwd"
}
```

**Unsafe code:**
```javascript
// ❌ DANGEROUS
const content = await fs.readFile(params.filePath, 'utf-8');
```

**Defense:**
```javascript
const path = require('path');

function isWithinWorkspace(filePath) {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, filePath);
  const workspaceAbs = path.resolve(workspaceRoot);
  return resolved === workspaceAbs || resolved.startsWith(workspaceAbs + path.sep);
}

async execute({ filePath }) {
  if (!isWithinWorkspace(filePath)) {
    return 'Error: Cannot access files outside workspace';
  }
  const fullPath = path.join(workspaceRoot, filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return content;
}
```

**Additional:**
- Validate file extensions if restricting to certain types
- Set maximum file size limits
- Use `fs.realPath()` to resolve symlinks and check final path

### 4. XSS via Output

**Risk:** Tool output containing HTML/JS that could be executed if displayed in a browser.

**Defense:**
- Never return raw HTML from tools
- If returning data for display, use plain text or safe JSON
- Escape user input if constructing strings that might be rendered

**Example:**
```javascript
// Unsafe if output goes to web view
return `<div>${params.userInput}</div>`;

// Safe
return `Result: ${params.userInput}`;
```

### 5. Secret Leakage

**Risk:** API keys, tokens, or other secrets exposed in logs or error messages.

**Unsafe:**
```javascript
console.log('Request:', JSON.stringify({ apiKey: process.env.API_KEY, url }));
```

**Defense:**
```javascript
console.log('Request:', { url, hasKey: !!process.env.API_KEY });
// OR use a sanitizer
function sanitize(obj) {
  const copy = { ...obj };
  delete copy.apiKey;
  delete copy.secret;
  return copy;
}
console.log('Request:', sanitize(params));
```

**Best practices:**
- Never log `process.env.*` values
- Use `console.error` only for non-sensitive errors
- Redact secrets in error messages before returning to user
- `.env` must be in `.gitignore`

### 6. Dependency Vulnerabilities

**Risk:** Third-party packages may have known vulnerabilities.

**Defense:**
```bash
npm audit
npm audit fix
```

Regularly update dependencies:
```bash
npm update
```

Use `npm ls` to check for duplicate or outdated packages.

### 7. DOS via Resource Exhaustion

**Risk:** Attacker causes your tool to consume all memory/CPU/disk.

**Examples:**
- Requesting extremely large files
- Infinite loops in parsing
- Creating millions of files

**Defense:**
```javascript
// Limit file size
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const stats = await fs.stat(filePath);
if (stats.size > MAX_FILE_SIZE) {
  return 'Error: File too large';
}

// Limit array sizes
const data = await readLargeJson();
if (data.length > 10000) {
  return 'Error: Too many items (max 10000)';
}

// Always have timeouts (see BEST_PRACTICES.md)
```

## Security Checklist

### Before Release

- [ ] **URL validation**: All URLs validated against whitelist, HTTPS only, no private IPs
- [ ] **Command safety**: No `exec()` with untrusted input; use `spawn()` with args array or whitelist
- [ ] **Path safety**: All file operations restricted to workspace via `isWithinWorkspace()`
- [ ] **Input limits**: File sizes, array lengths, string lengths bounded
- [ ] **Timeouts**: All external operations ≤30s
- [ ] **Secrets**: No hardcoded API keys; use `process.env.*` with presence checks
- [ ] **Logging**: No secrets logged; sanitize error outputs
- [ ] **Dependencies**: `npm audit` passes; no critical vulnerabilities
- [ ] **.env in .gitignore**: Confirmed
- [ ] **Code review**: Security-aware review performed

### On Every Load

When Roo loads tools, verify:
- No `eval()`, `new Function()`, `import()` in JavaScript files
- No `require()` with user-controlled input
- All tools pass `validate_tools.js` checks

## Defense-in-Depth

### Layers

1. **Input validation** (whitelisting): Validate early, reject invalid input
2. **Sandboxing**: Use `isWithinWorkspace()` for file ops
3. **Least privilege**: Request only needed permissions (don't request network if not needed)
4. **Monitoring**: Log all failures, review logs regularly
5. **Updates**: Keep dependencies updated, patch vulnerabilities quickly

### Principle of Least Authority

Each tool should have minimal capabilities:
- If tool doesn't need network access, don't use `fetch`
- If tool only reads files, don't use `exec`
- Separate tools by concern (don't combine file ops + network + exec in one tool unless necessary)

## Incident Response

If you discover a security issue in a Custom Tool:

1. **Immediate**: Remove or comment out the tool file
2. **Refresh** Custom Tools in Roo Code
3. **Investigate**: Check logs for evidence of exploitation
4. **Patch**: Fix the vulnerability
5. **Rotate secrets**: If API keys may have been exposed, revoke and generate new ones
6. **Audit**: Review all other tools for similar issues
7. **Document**: Add the vulnerability to your security checklist to prevent recurrence

## Security Policies

### Tool Approval Process

For team environments:
- All tools require peer review before deployment
- Security checklist must be completed
- Tools stored in version-controlled `.roo/tools/` directory
- CI/CD runs `validate_tools.js` and security scans

### Secrets Management

- Use a secrets manager (Vault, 1Password, Doppler) for production keys
- Never commit `.env` or keys to repository
- Rotate keys regularly (every 90 days minimum)
- Use least-privilege API keys (scope-limited)

### Monitoring

- Review Roo Code output logs weekly
- Set up alerts for unusual activity (excessive API calls, errors)
- Track tool usage: which tools are called most frequently, by whom

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- SSRF Prevention: https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
- Command Injection: https://owasp.org/www-community/attacks/Command_Injection

## Reporting Vulnerabilities

If you find a security vulnerability in this skill or its examples, please report it privately to the skill maintainer. Do not open a public issue.

---

**Remember:** Custom Tools have auto-approve power. Treat security as a first-class concern, not an afterthought.
