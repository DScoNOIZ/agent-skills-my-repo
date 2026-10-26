# Best Practices for Custom Tools

Comprehensive guide for writing high-quality, maintainable Custom Tools for Roo Code.

## 1. General Principles

### 1.1 Keep It Simple

- Start with JavaScript (CommonJS) unless TypeScript is necessary
- One tool = one responsibility (Single Responsibility Principle)
- Keep tools under 200 lines; split into multiple files if needed
- Use descriptive names: `api_fetch_user` not `api_v1`

### 1.2 Error Handling

**Always use try/catch in execute:**

```javascript
async execute(params) {
  try {
    const result = await doSomething(params.input);
    return result;
  } catch (error) {
    console.error('[MyTool] Error:', error);
    return `Error: ${error.message}`;
  }
}
```

**Do NOT:**
- Let errors throw uncaught (Roo will show generic error)
- Return raw error objects (sanitize messages)
- Swallow errors silently (always log)

### 1.3 Logging

Use structured logging for debugging:

```javascript
console.log('[MyTool] Params:', JSON.stringify(params, null, 2));
console.log('[MyTool] API response:', response.status);
console.error('[MyTool] Failed after retries:', lastError.message);
```

Logs appear in: **View → Output → "Roo Code"**

## 2. Async Operations

### 2.1 Always Async

`execute` **must** be an async function:

```javascript
async execute(params) {
  // This is correct
  return await something();
}

// This is WRONG:
execute(params) {
  return something(); // Not async, may cause issues
}
```

### 2.2 Timeouts

**All external operations must have timeouts ≤ 30 seconds:**

```javascript
function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

async execute(params) {
  const result = await withTimeout(fetch(url), 30000);
  return result;
}
```

For fetch, use `AbortSignal.timeout(30000)` (Node 18+):
```javascript
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000)
});
```

### 2.3 Retry Logic

For transient failures (network issues), use exponential backoff:

```javascript
const MAX_RETRIES = 3;

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // 1s, 2s, 3s
      }
    }
  }
  throw lastError;
}
```

## 3. Security Practices

### 3.1 Input Validation

**Validate ALL user inputs** before using them:

```javascript
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    const allowedHosts = ['api.example.com', 'github.com'];
    return allowedHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

async execute({ url }) {
  if (!isValidUrl(url)) {
    return 'Error: URL not allowed';
  }
  // Safe to use
}
```

### 3.2 File Path Safety

**Never trust user-provided paths.** Always restrict to workspace:

```javascript
const path = require('path');

function isWithinWorkspace(filePath) {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, filePath);
  return resolved.startsWith(path.resolve(workspaceRoot) + path.sep);
}

async execute({ filePath }) {
  if (!isWithinWorkspace(filePath)) {
    return 'Error: Cannot access files outside workspace';
  }
  // Safe to use
}
```

### 3.3 Command Injection Prevention

**Never use `exec` with user input directly:**

```javascript
// ❌ UNSAFE - injection possible
exec(`git commit -m "${userMessage}"`);

// ✅ SAFE - args as array
exec('git commit', ['-m', userMessage]);

// ✅ SAFER - whitelist
const ALLOWED_COMMANDS = {
  'git': ['status', 'commit', 'push'],
  'docker': ['ps', 'images']
};
const [cmd, ...args] = userCommand.split(' ');
if (!ALLOWED_COMMANDS[cmd]) {
  return 'Error: Command not allowed';
}
exec(cmd, args);
```

## 4. Environment Variables

### 4.1 Accessing Secrets

```javascript
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable required');
}
```

### 4.2 .env Files

For TypeScript tools, load `.env` explicitly:

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '.env') });
```

**Important:** `.env` is **not** automatically loaded into `process.env`. You must call `dotenv.config()`.

### 4.3 .env Location

Place `.env` in the tools directory:
- Global: `~/.roo/tools/.env`
- Project: `.roo/tools/.env`

Roo Code may copy the file to a cache directory. Use `__dirname` to locate it relative to the compiled .js file.

## 5. Parameter Design

### 5.1 Use Defaults Wisely

```javascript
parameters: {
  type: 'object',
  properties: {
    timeout: {
      type: 'number',
      default: 30000,
      minimum: 1000,
      maximum: 120000,
      description: 'Timeout in milliseconds (default: 30s)'
    }
  }
}
```

### 5.2 Provide Good Descriptions

The description is shown to AI. Be specific:

```javascript
url: {
  type: 'string',
  description: 'Full API endpoint URL (must be https:// and whitelisted host)'
}
```

Not just: `{ type: 'string', description: 'URL' }`

### 5.3 Enums Over Free Strings

```javascript
mode: {
  type: 'string',
  enum: ['fast', 'normal', 'thorough'],
  default: 'normal',
  description: 'Execution speed mode'
}
```

## 6. Return Values

### 6.1 String Returns (Recommended)

```javascript
return `Success: processed ${count} items`;
```

### 6.2 Object Returns

Objects are automatically `JSON.stringify`'d by Roo:

```javascript
return {
  success: true,
  itemsProcessed: count,
  skipped: skippedItems
};
// Roo converts to JSON string automatically
```

**Caution:** Complex objects with circular references will fail. Test your return values.

### 6.3 Error Messages

Return user-friendly, actionable error messages:

```javascript
// Good
return 'Error: File not found. Check the path and try again.';

// Bad
return `Error: ENOENT: no such file or directory, open '${filePath}'`;
```

In production, avoid exposing internal paths or stack traces.

## 7. Code Organization

### 7.1 Multiple Tools in One File

For related tools, group them:

```javascript
// Helper functions (not exported)
function validateUrl(url) { ... }

module.exports.fetchUser = { name: 'fetch_user', ... };
module.exports.updateUser = { name: 'update_user', ... };
```

### 7.2 Shared Utilities

For cross-file sharing, create a `lib/` directory:

```
~/.roo/tools/
├── lib/
│   └── utils.js
├── api-client.js
└── file-ops.js
```

Import with absolute path:
```javascript
const { withTimeout } = require('./lib/utils');
```

## 8. Testing

### 8.1 Local Testing

Test tools directly with Node:

```bash
node -e "require('./my-tool.js').myTool.execute({param: 'value'}).then(console.log)"
```

### 8.2 Validation Script

Use the provided `validate_tools.js`:

```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/**/*.js
```

### 8.3 Unit Tests

Write Jest tests for complex logic. Mock external calls (fetch, fs, exec).

See [fragments/06-testing.md](../fragments/06-testing.md) for full testing strategies.

## 9. Performance

### 9.1 Caching

For expensive operations, implement in-memory caching (cleared on Roo restart):

```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async execute(params) {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  const result = await computeExpensive(params);
  cache.set(cacheKey, { value: result, timestamp: Date.now() });
  return result;
}
```

### 9.2 Avoid Blocking Operations

Don't use synchronous `fs.readFileSync` in async execute. Use promise-based versions:

```javascript
const fs = require('fs/promises');
const content = await fs.readFile(filePath, 'utf-8');
```

## 10. Maintenance

### 10.1 Documentation

Add a `README.md` in your tools directory:
- Purpose of each tool
- Parameter reference
- Examples
- Environment variables required

### 10.2 Versioning

If you maintain a collection of tools, use semantic versioning in `package.json`.

### 10.3 Dependency Management

Keep dependencies minimal. Audit regularly:

```bash
npm audit
npm update
```

## 11. Common Pitfalls

| Pitfall | Why it's bad | Fix |
|---------|--------------|-----|
| Missing `async` on execute | Roo may not wait for Promise | Add `async` keyword |
| No timeout on fetch | Hangs indefinitely | Use `AbortSignal.timeout(30000)` |
| Hardcoded API keys | Security risk, leaks secrets | Use `process.env.*` |
| Using `eval()` or `new Function()` | Security risk, validation bypass | Avoid entirely |
| Forgetting to `Refresh` after changes | Roo uses cached version | Ctrl+Shift+P → "Custom Tools: Refresh" |
| Returning `undefined` | Roo shows blank result | Always return string/object |

## 12. Production Checklist

Before deploying to production:

- [ ] All external operations have timeouts ≤30s
- [ ] All inputs validated (URL whitelist, path checks, command whitelist)
- [ ] API keys only via `process.env.*`, no hardcoding
- [ ] No `eval()`, `new Function()`, or `import()` in JS files
- [ ] Error messages are user-friendly, no internal paths/stack traces
- [ ] Dependencies are up-to-date (`npm audit` passes)
- [ ] Unit tests cover critical paths (>80% coverage)
- [ ] Integration tests with mock external services
- [ ] `.env` is in `.gitignore`
- [ ] Documentation updated (README.md with examples)
- [ ] Tested with `validate_tools.js` (no errors)
- [ ] Tested interactively via `test_tools_interactively.js`

See [fragments/13-checklists.md](../fragments/13-checklists.md) for detailed checklists.

## 13. Further Reading

- [FORMAT_SPEC.md](FORMAT_SPEC.md) - Full format specification
- [SECURITY.md](SECURITY.md) - In-depth security guide
- [TESTING.md](TESTING.md) - Comprehensive testing strategies
- [DEBUGGING.md](DEBUGGING.md) - Debugging techniques
