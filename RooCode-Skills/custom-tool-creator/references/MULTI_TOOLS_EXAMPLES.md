# Multi-Tool Code Examples for Custom Tools

Complete, runnable examples for organizing multiple tools in a single file or across multiple files.

## Table of Contents
1. [Single File: Multiple Tools](#single-file-multiple-tools)
2. [Default Object Export](#default-object-export)
3. [File Structure Organization](#file-structure-organization)
4. [Factory Pattern (HTTP Client)](#factory-pattern-http-client)
5. [Dependency Injection Pattern](#dependency-injection-pattern)
6. [Module Pattern with State](#module-pattern-with-state)
7. [Configuration Sharing](#configuration-sharing)
8. [Export Aggregation (index.js)](#export-aggregation-indexjs)
9. [Testing Multi-Tool Files](#testing-multi-tool-files)
10. [Monorepo Organization](#monorepo-organization)

---

## Single File: Multiple Tools

Export each tool as a separate property of `module.exports`.

**File:** `~/.roo/tools/utilities.js`

```javascript
// Private helpers (not exported)
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Tool 1: date formatter
module.exports.formatDate = {
  name: 'format_date',
  description: 'Format date to string',
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'ISO date string' },
      format: {
        type: 'string',
        enum: ['iso', 'short', 'long'],
        default: 'iso'
      }
    },
    required: ['date']
  },
  async execute({ date, format = 'iso' }) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Error: Invalid date';
    }

    switch (format) {
      case 'short': return d.toLocaleDateString();
      case 'long': return d.toLocaleString();
      default: return d.toISOString();
    }
  }
};

// Tool 2: email validator
module.exports.validateEmail = {
  name: 'validate_email',
  description: 'Validate email format',
  parameters: {
    type: 'object',
    properties: {
      email: { type: 'string', description: 'Email to validate' },
      checkMX: { type: 'boolean', default: false }
    },
    required: ['email']
  },
  async execute({ email, checkMX = false }) {
    if (!validateEmail(email)) {
      return { valid: false, reason: 'Invalid format' };
    }

    if (checkMX) {
      // MX record check (requires DNS module)
      // ...
    }

    return { valid: true, email };
  }
};
```

**Check exported tools:**

```bash
node -e "console.log(Object.keys(require('./utilities.js')))"
# Output: [ 'formatDate', 'validateEmail' ]
```

---

## Default Object Export

Alternative: export all tools as a single object.

```javascript
// ~/.roo/tools/all-tools.js
module.exports = {
  tool1: { name: 'tool1', /* ... */ },
  tool2: { name: 'tool2', /* ... */ },
  tool3: { name: 'tool3', /* ... */ }
};

// Destructure when requiring:
const { tool1, tool2, tool3 } = require('./all-tools');
```

---

## File Structure Organization

For large projects, organize tools by category in separate files and aggregate via `index.js`.

```
~/.roo/tools/
├── api/
│   ├── client.js       # exports: apiClient, apiGet, apiPost
│   └── auth.js         # exports: login, logout, refreshToken
├── files/
│   ├── reader.js       # exports: readFile, readJson
│   └── writer.js       # exports: writeFile, writeJson
├── git/
│   └── operations.js   # exports: gitStatus, gitCommit, gitPush
└── index.js            # re-exports everything from subfolders
```

**index.js:**

```javascript
module.exports = {
  ...require('./api/client'),
  ...require('./api/auth'),
  ...require('./files/reader'),
  ...require('./files/writer'),
  ...require('./git/operations')
};
```

Now Roo loads `~/.roo/tools/index.js` and sees all tools.

**TypeScript version:**

```typescript
// src/api/client.ts
export const apiClient = defineCustomTool({ ... });
export const apiGet = defineCustomTool({ ... });

// src/index.ts
export { apiClient, apiGet } from './api/client';
export { fileReader, fileWriter } from './files';

// After compilation, dist/index.js contains all tools
```

---

## Factory Pattern (HTTP Client)

Create a reusable factory for shared configuration.

**File:** `lib/http-client.js`

```javascript
function createHttpClient(baseUrl, options = {}) {
  const { timeout = 30000, headers = {} } = options;

  return {
    async request(endpoint, method = 'GET', body) {
      const url = `${baseUrl}${endpoint}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
        clearTimeout(timer);
        return response.json();
      } finally {
        clearTimeout(timer);
      }
    },

    get(endpoint) {
      return this.request(endpoint, 'GET');
    },

    post(endpoint, body) {
      return this.request(endpoint, 'POST', body);
    }
  };
}

module.exports = { createHttpClient };
```

**Usage:**

```javascript
// ~/.roo/tools/api-tools.js
const { createHttpClient } = require('./lib/http-client');

const apiClient = createHttpClient(process.env.API_BASE_URL, {
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`
  }
});

module.exports.getUsers = {
  name: 'get_users',
  description: 'Get list of users from API',
  parameters: { /* ... */ },
  async execute(params) {
    return apiClient.get('/users');
  }
};

module.exports.createUser = {
  name: 'create_user',
  description: 'Create new user',
  parameters: { /* ... */ },
  async execute(params) {
    return apiClient.post('/users', params);
  }
};
```

**Benefits:**
- Single configured client shared across tools
- Connection reuse and caching possible
- Easy to test (mock the factory)
- DRY — configuration in one place

---

## Dependency Injection Pattern

Inject dependencies for testability.

```javascript
// ~/.roo/tools/db-tools.js
async function defaultDbQuery(sql, params) {
  // real implementation
  return db.all(sql, params);
}

module.exports.query = {
  name: 'db_query',
  description: 'Execute SQL query',
  parameters: { /* ... */ },
  async execute({ sql, params = [] }, context) {
    // In production use defaultDbQuery; in tests pass mock
    const db = context?.config?.db || defaultDbQuery;
    return await db(sql, params);
  }
};
```

**Test:**

```javascript
// __tests__/db-tools.test.js
const mockDb = jest.fn().mockResolvedValue([{ id: 1, name: 'test' }]);

const tools = require('../db-tools.js');
tools.query.execute({ sql: 'SELECT * FROM users' }, { config: { db: mockDb } })
  .then(result => {
    expect(mockDb).toHaveBeenCalledWith('SELECT * FROM users', []);
    expect(result).toEqual([{ id: 1, name: 'test' }]);
  });
```

---

## Module Pattern with State

Encapsulate shared state using IIFE (Immediately Invoked Function Expression).

```javascript
// ~/.roo/tools/cache-tool.js
const Cache = (function() {
  const cache = new Map();
  const TTL = 60000; // 1 minute

  function get(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > TTL) {
      cache.delete(key);
      return null;
    }
    return item.value;
  }

  function set(key, value) {
    cache.set(key, { value, timestamp: Date.now() });
  }

  function clear() {
    cache.clear();
  }

  return { get, set, clear };
})();

module.exports.cachedGet = {
  name: 'cached_get',
  description: 'GET request with caching',
  parameters: { /* url */ },
  async execute({ url }) {
    const cached = Cache.get(url);
    if (cached) {
      return { cached: true, data: cached };
    }

    const response = await fetch(url);
    const data = await response.json();
    Cache.set(url, data);
    return { cached: false, data };
  }
};

module.exports.clearCache = {
  name: 'clear_cache',
  description: 'Clear internal cache',
  parameters: { type: 'object', properties: {} },
  async execute() {
    Cache.clear();
    return 'Cache cleared';
  }
};
```

**Caution:** State persists in memory between tool calls and doesn't reset on Refresh (only on VSCode restart). Document this behavior.

---

## Configuration Sharing

Shared configuration via module-level variables.

```javascript
// ~/.roo/tools/shared-config.js
const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  logLevel: process.env.LOG_LEVEL || 'info'
};

function configure(overrides) {
  Object.assign(config, overrides);
}

module.exports.configTool = {
  name: 'config_tool',
  description: 'Get/update tool configuration',
  parameters: {
    type: 'object',
    properties: {
      get: { type: 'string', description: 'Config key to retrieve' },
      set: {
        type: 'object',
        description: 'Key-value pairs to set'
      }
    }
  },
  async execute({ get, set }) {
    if (set) {
      configure(set);
      return `Updated: ${Object.keys(set).join(', ')}`;
    }
    if (get) {
      return { [get]: config[get] };
    }
    return config;
  }
};
```

---

## Export Aggregation (index.js)

If tools are spread across multiple files, create an `index.js` to aggregate them.

```javascript
// ~/.roo/tools/index.js
const apiTools = require('./api/client');
const fileTools = require('./files');
const gitTools = require('./git/operations');

// Spread all tools into root exports
module.exports = {
  ...apiTools,
  ...fileTools,
  ...gitTools
};
```

**Verify aggregation:**

```bash
node -e "console.log(Object.keys(require('./index.js')))"
# Should list all tool names from all sub-files
```

**Roo loads:** `~/.roo/tools/index.js` → all tools become available.

---

## Testing Multi-Tool Files

```javascript
// __tests__/all-tools.test.js
const tools = require('../all-tools.js');

describe('Tool suite', () => {
  test('exports all expected tools', () => {
    expect(Object.keys(tools)).toEqual([
      'formatDate',
      'validateEmail',
      'apiClient',
      'fileReader',
      'fileWriter'
    ]);
  });

  describe('formatDate', () => {
    test('formats ISO date', async () => {
      const result = await tools.formatDate.execute({ date: '2024-01-15T10:30:00Z' });
      expect(result).toBe('2024-01-15');
    });
  });

  describe('validateEmail', () => {
    test('accepts valid email', async () => {
      const result = await tools.validateEmail.execute({ email: 'test@example.com' });
      expect(result.valid).toBe(true);
    });
  });
});
```

---

## Monorepo Organization

Use npm workspaces for complex tool suites.

```
tools/
├── package.json                # workspace root
├── tsconfig.base.json
├── packages/
│   ├── api-client/
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   └── file-ops/
│       ├── package.json
│       └── src/
└── node_modules/
```

**Root package.json:**

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

**Install once:**

```bash
cd tools
npm install  # installs deps for all packages
```

Then `.roo/tools/` can symlink to `tools/packages/api-client/dist/`.

---

## Limits and Caveats

### File Size

Roo transpiles via esbuild. Very large files (>500KB) can slow loading.

**Recommendation:** If more than 10 tools in one file, split into multiple files and use `index.js` aggregation.

### State Sharing

Module-level state is shared between all tool calls within the same file:

```javascript
let requestCount = 0;

module.exports.tool1 = {
  async execute() {
    requestCount++;
    return `Count: ${requestCount}`;
  }
};

module.exports.tool2 = {
  async execute() {
    requestCount++;
    return `Count: ${requestCount}`;
  }
};
```

This state persists in Roo's memory and doesn't reset between Refreshes (only on VSCode restart). Prefer stateless tools or external storage (Redis, file cache).

### Circular Dependencies

Avoid cyclic imports:

```javascript
// a.js
module.exports.a = require('./b');  // circular!

// b.js
module.exports.b = require('./a');
```

Result: `undefined` or `Maximum call stack`.

### Hot Reload

After any change to aggregator files (`index.js`), you must manually Refresh Custom Tools. Roo doesn't watch for changes.

Workflow:

```bash
# Changed api-client.js
npx tsc  # if TypeScript
# Then Ctrl+Shift+P → "Custom Tools: Refresh"
```

---

## Checklist: Multi-Tool Organization

- [ ] **Flat export** — `module.exports.toolName = {...}` (not nested objects)
- [ ] **Unique names** — no duplicate tool names in same file
- [ ] **Shared utilities** — extracted to separate functions/modules
- [ ] **No circular dependencies**
- [ ] **State management** — state is explicit, documented, with reset capability
- [ ] **Initialization** — expensive initializations are lazy or one-time
- [ ] **Test coverage** — each tool has unit tests
- [ ] **Export aggregation** — if multiple files, there's an index.js exporting all
- [ ] **Documentation** — README describes each tool in bundle

---

## When to Split vs Combine

| Criterion | Combine (single file) | Split (multiple files) |
|-----------|----------------------|-----------------------|
| Number of tools | 1-5 | >5 |
| Shared state | Yes | No (stateless) |
| Related functionality | Tight coupling | Unrelated domains |
| Testing | One suite | Separate suites |
| Team ownership | One person | Different people |
| Deployment | All or nothing | Independent update |

**Rule of thumb:** If tools are logically related (all API clients, all file ops) — combine. If diverse domains (API + Git + DB) — split.

---

## TypeScript: defineCustomTool with Multiple Tools

With `defineCustomTool`, you can export a default object containing multiple tools:

**src/index.ts:**

```typescript
import { defineCustomTool, parametersSchema as z } from "@roo-code/types";

export const apiClient = defineCustomTool({
  name: "api_client",
  parameters: z.object({
    url: z.string().url()
  }),
  async execute(args) {
    return fetch(args.url).then(r => r.json());
  }
});

export const fileReader = defineCustomTool({
  name: "file_reader",
  parameters: z.object({
    path: z.string()
  }),
  async execute(args) {
    return require('fs').promises.readFile(args.path, 'utf-8');
  }
});

// Default export combines all tools
export default {
  apiClient,
  fileReader
};
```

After compilation, `dist/index.js` exports `{ apiClient, fileReader }` which Roo loads.

---

**Related:** See [11-typescript.md](fragments/11-typescript.md) for TypeScript-specific patterns and best practices.
