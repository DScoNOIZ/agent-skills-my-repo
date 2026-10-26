# 09-environment-variables: Managing Secrets and Configuration

## What Are Environment Variables?

Environment variables are key-value pairs external to your tool code. They provide:
- **Secrets**: API keys, tokens, webhook URLs (never commit to Git)
- **Configuration**: Endpoints, timeouts, log levels
- **System context**: Workspace paths, user settings

Roo Code tools access them via `process.env`.

## Variable Types and Usage

| Type | Example | Usage |
|------|---------|-------|
| **Secrets** | `API_KEY`, `SLACK_WEBHOOK_URL` | Sensitive values, store in `.env` |
| **Config** | `API_BASE_URL`, `TIMEOUT`, `LOG_LEVEL` | Tunable settings |
| **System** | `WORKSPACE_ROOT`, `HOME` | Auto-set by OS/Roo |

**Why env vars?** Separation of code and configuration. Same tool works across dev/staging/prod with different values.

## Setting Environment Variables

### 1. Shell (temporary)

```bash
export API_KEY="sk-..."
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

# Start VS Code from same shell
code .
```

Roo inherits parent process environment.

### 2. `.env` File (Recommended)

Create `.env` in the tools directory (`~/.roo/tools/.env` or `<project>/.roo/tools/.env`):

```bash
# API keys
OPENROUTER_API_KEY=sk-...
GITHUB_TOKEN=ghp_...

# Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ

# Configuration
API_BASE_URL=https://api.example.com/v1
LOG_LEVEL=info
MAX_RETRIES=3
```

**Critical rules:**
- `.env` → `.gitignore` (never commit)
- Roo copies `.env` to cache directory when loading tools
- Tool must **explicitly load** `.env` using `dotenv`

## Loading `.env` in Your Tool

### With `defineCustomTool` (TypeScript/ESM)

```typescript
import { defineCustomTool } from "@roo-code/types";
import dotenv from "dotenv";
import path from "path";

// MUST use __dirname to find .env in cache dir (not source dir)
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineCustomTool({
  name: 'my_tool',
  async execute() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return 'Error: API_KEY not set';
    // ...
  }
});
```

**Why `__dirname`?** Roo copies tools to a temporary cache directory. `__dirname` points to the cache location where `.env` actually resides.

### With CommonJS (no `defineCustomTool`)

```javascript
const path = require('path');

// Resolve __dirname in CommonJS
const __dirname = path.dirname(require.main?.filename || process.argv[1]);

// Load .env if present (dotenv must be installed)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  console.log('[MyTool] dotenv not available, using process.env only');
}

module.exports.myTool = {
  name: 'my_tool',
  async execute() {
    const apiKey = process.env.API_KEY;
    // ...
  }
};
```

## Safe Access Patterns

### Required Variables with Validation

```javascript
function getEnvVar(name, description = '') {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required${description ? ` (${description})` : ''}`);
  }
  return value;
}

module.exports.apiTool = {
  name: 'api_tool',
  async execute() {
    const apiKey = getEnvVar('API_KEY', 'Get it from https://api.example.com/keys');
    const baseUrl = getEnvVar('API_BASE_URL', 'Base endpoint URL');
    // ...
  }
};
```

### Fallback Values (Development Only)

```javascript
const apiKey = process.env.API_KEY || 'dev-key-here';
const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const timeout = parseInt(process.env.TIMEOUT) || 30000;
```

**Never use fallbacks for production secrets.** Only for local development.

### Debug Logging (Masked)

```javascript
console.log('[MyTool] Env vars:', {
  API_KEY: process.env.API_KEY ? '***masked***' : 'NOT SET',
  API_BASE_URL: process.env.API_BASE_URL || 'default',
  NODE_ENV: process.env.NODE_ENV
});
```

**Never log actual secret values!** Mask or only log presence.

## Security Checklist

- [ ] `.env` created and in `.gitignore`
- [ ] `dotenv` installed and configured
- [ ] `__dirname` used to locate `.env` in cache
- [ ] Required variables validated at runtime
- [ ] No secrets logged (masked if needed)
- [ ] Fallbacks only for dev, not production

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `API_KEY is undefined` | `.env` not loaded | Use `path.join(__dirname, '.env')` |
| `Cannot find module 'dotenv'` | Not installed | `npm install dotenv` |
| `.env` changes not picked up | Roo cached old version | Refresh Custom Tools |
| Secrets in Git history | `.env` committed | Remove from history, rotate keys |

---

**Next:** For managing npm packages and dependencies, read [10-dependencies.md](10-dependencies.md).
