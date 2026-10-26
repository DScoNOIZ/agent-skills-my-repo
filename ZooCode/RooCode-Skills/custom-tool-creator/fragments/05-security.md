# 05-security: Security Checklist for Custom Tools

Custom Tools have **auto-approve** and access to the filesystem/network. Security is critical.

## Main Threats

| Threat | Description | Example |
|--------|-------------|---------|
| SSRF | Making requests to internal hosts (localhost, 169.254.169.254) | `fetch('http://169.254.169.254/latest/meta-data/iam/security-credentials/')` |
| Path Traversal | Accessing files outside workspace via `../../../etc/passwd` | `fs.readFile('../../../etc/passwd')` |
| Command Injection | Injecting commands into `exec()` | `exec('git commit -m ' + userInput)` → `"; rm -rf /"` |
| DoS | Huge payloads, infinite loops | 1GB JSON, `while(true){}` |
| Secret Leakage | Logging API keys, exposing in errors | `console.log('Using key:', process.env.API_KEY)` |

## SSRF Prevention

### URL Whitelist

```javascript
const ALLOWED_HOSTS = ['api.example.com', 'github.com', 'localhost'];

function isAllowedUrl(url) {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

async execute({ url }) {
  if (!isAllowedUrl(url)) {
    return `Error: Host ${new URL(url).hostname} not allowed`;
  }
  return fetch(url);
}
```

### Block private IP ranges

```javascript
const PRIVATE_RANGES = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '127.0.0.0/8',
  '169.254.169.254/32'  // AWS metadata
];

function isPrivateIp(ip) {
  return PRIVATE_RANGES.some(range => ipInRange(ip, range));
}

async execute({ url }) {
  const parsed = new URL(url);
  const dnsAddresses = await resolveDns(parsed.hostname);
  if (dnsAddresses.some(isPrivateIp)) {
    return 'Error: Private IP addresses not allowed';
  }
  return fetch(url);
}
```

**For simplicity:** Use host whitelist instead of IP blocklists.

## Path Traversal Prevention

### Workspace restriction

```javascript
const path = require('path');
const fs = require('fs/promises');

function isWithinWorkspace(filePath) {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, filePath);
  return resolved.startsWith(path.resolve(workspaceRoot) + path.sep);
}

async execute({ filePath }) {
  if (!isWithinWorkspace(filePath)) {
    return `Error: Access denied (outside workspace)`;
  }
  return fs.readFile(filePath, 'utf-8');
}
```

### Sanitize paths

```javascript
function sanitizePath(filePath) {
  const normalized = path.normalize(filePath);
  if (normalized.includes('..')) {
    throw new Error('Parent directory traversal not allowed');
  }
  return normalized;
}
```

## Command Injection Prevention

### Never use `exec` with user input directly

```javascript
// ❌ BAD — vulnerable
exec(`git commit -m "${userMessage}"`);

// ✅ GOOD — arguments as array
exec('git commit', ['-m', userMessage]);

// ✅ BETTER — whitelist commands
const ALLOWED_COMMANDS = {
  'git': ['status', 'diff', 'log', 'checkout'],
  'docker': ['ps', 'images', 'run'],
  'kubectl': ['get', 'apply', 'delete']
};

function validateCommand(command, args) {
  const [cmd, ...rest] = command.split(' ');
  if (!ALLOWED_COMMANDS[cmd]) {
    throw new Error(`Command ${cmd} not allowed`);
  }
  if (!ALLOWED_COMMANDS[cmd].includes(rest[0])) {
    throw new Error(`Subcommand ${rest[0]} not allowed for ${cmd}`);
  }
  return { command: cmd, args: rest };
}

async execute({ command }) {
  const { command: cmd, args } = validateCommand(command);
  return exec(cmd, args);  // safe
}
```

### Prefer `spawn` over `exec`

`spawn` doesn't use shell, less injection risk:

```javascript
const { spawn } = require('child_process');

async execute({ command, args = [] }) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    proc.on('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr));
    });
  });
}
```

## API Key Management

### Never hardcode

```javascript
// ❌ BAD
const API_KEY = 'sk-1234567890abcdef';

// ✅ GOOD
const API_KEY = process.env.MY_TOOL_API_KEY;
if (!API_KEY) {
  throw new Error('MY_TOOL_API_KEY environment variable required');
}
```

### .env files

**Create `.env` in the tools directory:**

```
# ~/.roo/tools/.env  or  <project>/.roo/tools/.env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX
API_SECRET=your-secret-key
OPENROUTER_API_KEY=sk-...
```

**Loading (only for defineCustomTool):**

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineCustomTool({
  name: "notify_slack",
  async execute({ message }) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return 'Error: SLACK_WEBHOOK_URL not set';
    }
    // ...
  }
});
```

**Important:**
- `.env` is copied to cache directory when tools are loaded
- Use `__dirname` to locate .env in cache
- Add `.env` to `.gitignore`!

### Presence check

```javascript
function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

async execute({}) {
  const apiKey = getEnvVar('API_KEY');
  // ...
}
```

## Input Size Limits

Protection against DoS via huge payloads:

```javascript
parameters: {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      maxLength: 1024 * 100,  // max 100KB
      description: 'Text content (max 100KB)'
    },
    files: {
      type: 'array',
      maxItems: 1000,  // max 1000 files
      items: { type: 'string' }
    }
  }
}
```

Additional validation in execute:

```javascript
async execute({ content, files }) {
  if (content && content.length > 100 * 1024) {
    return 'Error: Content too large (>100KB)';
  }
  if (files && files.length > 1000) {
    return 'Error: Too many files (>1000)';
  }
  // ...
}
```

## Rate Limiting

If the tool makes external API calls, add rate limiting:

```javascript
const rateLimiter = new Map();  // key → {count, resetTime}

function checkRateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimiter.get(key) || { count: 0, reset: now + windowMs };

  if (now > record.reset) {
    record.count = 0;
    record.reset = now + windowMs;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  rateLimiter.set(key, record);
  return true;
}

async execute({ apiKey, ...rest }) {
  const caller = context?.task?.id || 'unknown';
  if (!checkRateLimit(caller)) {
    return 'Error: Rate limit exceeded (10 calls/min)';
  }
  // ...
}
```

## Logging without Secrets

**❌ BAD:**

```javascript
console.log('API request:', { url, headers: { Authorization: `Bearer ${apiKey}` } });
// Log contains API key!
```

**✅ GOOD:**

```javascript
console.log('API request:', { url, method: 'POST' });
// Don't log headers with keys

console.error('API error:', error.message);
// Don't log error.response.data if it may contain PII
```

## Dependencies Security

### Audit dependencies

```bash
cd ~/.roo/tools
npm audit
npm audit fix
```

Update regularly:

```bash
npm outdated
npm update
```

### Minimize dependencies

Every dependency is a potential vulnerability. Use only what's necessary.

**Example:** Instead of `lodash` for simple `_.debounce`, write your own function.

## XML/JSON Injection

If parsing XML/JSON from untrusted sources:

```javascript
const xml2js = require('xml2js');

async execute({ xmlContent }) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    ignoreAttrs: false
  });

  try {
    const result = await parser.parseStringPromise(xmlContent);
    // Validate result, don't trust structure
    return result;
  } catch (error) {
    return `Error: Invalid XML: ${error.message}`;
  }
}
```

## Timeout Configuration

All external calls must have a timeout:

```javascript
// Fetch with AbortController
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);

// child_process
const timer = setTimeout(() => proc.kill('SIGKILL'), 30000);

// DB queries
await Promise.race([db.query(sql), timeout(30000)]);
```

## Security Checklist

Before using a tool, check:

- [ ] **No hardcoded secrets** — API keys only via env vars
- [ ] **URL validation** — whitelist hosts, block private IPs
- [ ] **Path sanitization** — workspace restriction, no `..`
- [ ] **Command injection prevention** — no `exec` with user input, use `spawn` or whitelist
- [ ] **Input size limits** — `maxLength`, `maxItems` in schema
- [ ] **Rate limiting** — if making external API calls
- [ ] **Timeout configured** — all async operations ≤30s
- [ ] **Error messages clean** — don't reveal internal details
- [ ] **Logs sanitized** — no API keys, PII
- [ ] **Dependencies updated** — `npm audit` clean
- [ ] **.env in .gitignore** — secrets not in repository

## Production Security

For production deployment in a team:

1. **Code review** — all tools undergo review
2. **Static analysis** — `eslint` with security plugins (`eslint-plugin-security`)
3. **Dependency scanning** — `npm audit`, Snyk, or similar
4. **Running in sandbox** — if possible, isolate tools
5. **Monitoring** — log all calls, watch for anomalies

## Incident Response

If a tool is compromised:

1. **Disable immediately** — delete or rename the file
2. **Check logs** — find what data may have been affected
3. **Rotate secrets** — if keys potentially leaked
4. **Review access** — who had access to this tool
5. **Patch and redeploy** — fix the vulnerability, deploy update

## Further Reading

- **OWASP Top 10** — https://owasp.org/www-project-top-ten/
- **Node.js Security** — https://nodejs.org/en/docs/guides/security/
- **Roo Code Custom Tools security** — official documentation

**See also:** [14-checklists.md](13-checklists.md) for the full checklist.
