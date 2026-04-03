# 12-multi-tools: Organizing Multiple Tools (Conceptual Guide)

Multiple tools can coexist in a single file or span across multiple files with aggregation.

## Core Principle: Flat Exports

Roo discovers tools by enumerating `module.exports`. Each tool must be a **direct property**:

```javascript
// ✅ Correct: flat exports
module.exports.formatDate = { name: 'format_date', ... };
module.exports.validateEmail = { name: 'validate_email', ... };

// ❌ Wrong: nested
module.exports.tools = {
  formatDate: { ... },
  validateEmail: { ... }
};
```

Only top-level properties are detected.

## When to Combine vs Split

| Criterion | Combine (single file) | Split (multiple files) |
|-----------|----------------------|-----------------------|
| # of tools | 1-5 | >5 |
| Shared state | Yes | No (stateless) |
| Functionality | Tightly related | Unrelated domains |
| Testing | One suite | Separate suites |
| Team ownership | Single person | Multiple people |
| Deployment | All-or-nothing | Independent updates |

**Rule of thumb:** Group by domain (all API tools together, all file tools together). If file exceeds ~500KB or >10 tools, split.

## Single File Pattern

Define private helpers at module scope, export each tool separately.

```javascript
// ~/.roo/tools/utilities.js

// Private helper (not exported)
function formatDate(date) { /* ... */ }

module.exports.formatDate = {
  name: 'format_date',
  parameters: { /* ... */ },
  async execute(params) { /* uses formatDate helper */ }
};

module.exports.validateEmail = { /* ... */ };
```

**Advantages:**
- Shared helpers without duplication
- Module-level state (if needed)
- Easy to manage related tools

**Disadvantages:**
- Larger file size
- All tools reload together on changes

## Aggregation Pattern (index.js)

For distributed organization:

```
~/.roo/tools/
├── api/
│   ├── client.js      # exports: apiClient, apiGet
│   └── auth.js        # exports: login, logout
├── files/
│   ├── reader.js      # exports: readFile, readJson
│   └── writer.js      # exports: writeFile, writeJson
└── index.js           # re-exports everything
```

**index.js:**

```javascript
module.exports = {
  ...require('./api/client'),
  ...require('./api/auth'),
  ...require('./files/reader'),
  ...require('./files/writer')
};
```

Roo loads `~/.roo/tools/index.js` and sees all tools flattened.

**TypeScript:**
- Compile each `.ts` to `.js` in `dist/`
- `dist/index.js` aggregates `dist/api/client.js`, etc.
- Export named from `src/index.ts`, compile to CJS

## Factory Pattern for Shared Configuration

Extract common setup into a factory function:

```javascript
// lib/http-client.js
function createHttpClient(baseUrl, options = {}) {
  const { timeout = 30000, headers = {} } = options;

  return {
    async request(endpoint, method = 'GET', body) { /* ... */ },
    get(endpoint) { return this.request(endpoint, 'GET'); },
    post(endpoint, body) { return this.request(endpoint, 'POST', body); }
  };
}

module.exports = { createHttpClient };
```

Use in tools:

```javascript
const { createHttpClient } = require('./lib/http-client');

const apiClient = createHttpClient(process.env.API_BASE_URL, {
  timeout: 30000,
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
});

module.exports.getUsers = {
  name: 'get_users',
  async execute() { return apiClient.get('/users'); }
};
```

**Benefits:** Single source of truth for config, connection reuse, easy to test (inject mock).

## Dependency Injection

Pass dependencies via `context.config` for testability:

```javascript
async function defaultDbQuery(sql, params) { /* real impl */ }

module.exports.query = {
  name: 'db_query',
  async execute({ sql, params = [] }, context) {
    const db = context?.config?.db || defaultDbQuery;
    return await db(sql, params);
  }
};
```

Tests inject mock:

```javascript
const mockDb = jest.fn().mockResolvedValue([{ id: 1 }]);
await tools.query.execute({ sql: 'SELECT 1' }, { config: { db: mockDb } });
```

## State Management

Module-level variables are shared between all tool calls in the same file:

```javascript
let requestCount = 0;

module.exports.toolA = {
  async execute() { requestCount++; return requestCount; }
};

module.exports.toolB = {
  async execute() { requestCount++; return requestCount; }
};
```

**Important:** State persists in memory across calls and does NOT reset on "Refresh Custom Tools". Only VSCode restart clears it. Use cautiously; consider external storage (Redis, file) for important state.

## Configuration Sharing

Module-level config object with setter:

```javascript
const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.TIMEOUT) || 30000
};

function configure(overrides) {
  Object.assign(config, overrides);
}

module.exports.configTool = {
  name: 'config_tool',
  parameters: { /* get, set */ },
  async execute({ get, set }) {
    if (set) { configure(set); return `Updated`; }
    if (get) { return { [get]: config[get] }; }
    return config;
  }
};
```

## Circular Dependencies — AVOID

Cyclic imports break module initialization:

```javascript
// a.js: module.exports.a = require('./b');  // circular
// b.js: module.exports.b = require('./a');
```

Result: `undefined` or stack overflow. Refactor to extract shared logic into a third module.

## Hot Reload Behavior

After changing any tool file:
1. Rebuild if TypeScript (`npx tsc`)
2. **Manual Refresh:** Ctrl+Shift+P → "Custom Tools: Refresh"
3. Roo reloads from `.roo/tools/` (or cache)

Roo does not auto-watch. Changes require explicit refresh.

## Production Considerations

- **File size:** Roo uses esbuild to parse; files >500KB may slow startup
- **Memory:** Stateful tools accumulate memory; prefer stateless
- **Lazy loading:** For heavy helpers, import inside `execute` if rarely used
- **Index aggregation:** Use `index.js` to keep entry point small; separate large modules

## Checklist: Multi-Tool Organization

- [ ] All tools exported as flat properties: `module.exports.toolName = {...}`
- [ ] Unique tool names within the file/index
- [ ] Shared utilities extracted to separate functions (not inline in each tool)
- [ ] No circular dependencies
- [ ] State is explicit and documented (if present)
- [ ] Expensive initializations are lazy or one-time
- [ ] Unit tests cover each tool
- [ ] If multiple files → `index.js` aggregates all
- [ ] README documents each tool's purpose

## Namespacing

To avoid name collisions, use prefixes:

```javascript
module.exports.apiGetUsers = { name: 'api_get_users', ... };
module.exports.fileRead = { name: 'file_read', ... };
```

Avoid nested objects; Roo won't find them.

## TypeScript: Multiple Tools

In TypeScript, use named exports and compile to CommonJS:

**src/index.ts:**

```typescript
export { apiClient } from './api-client';
export { fileOps } from './file-ops';
```

After `tsc`, `dist/index.js` exports `{ apiClient: ..., fileOps: ... }` which Roo loads as two tools.

With `defineCustomTool`, each tool is a `defineCustomTool()` call; aggregate into a default export if needed.

## Complete Code Examples

See `references/MULTI_TOOLS_EXAMPLES.md` for full, runnable examples:
- Single file with multiple tools
- Factory pattern (HTTP client)
- Dependency injection
- Module pattern with state
- Configuration sharing
- Index aggregation
- Testing suite
- Monorepo organization

---

**Next:** See Custom Tools limitations in [13-limitations.md](fragments/13-limitations.md).
