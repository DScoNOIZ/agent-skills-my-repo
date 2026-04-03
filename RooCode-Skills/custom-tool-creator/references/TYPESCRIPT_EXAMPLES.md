# TypeScript Code Examples for Custom Tools

This reference contains complete, runnable examples. Copy-paste into your project and adapt.

## Table of Contents
1. [Basic Tool without `defineCustomTool`](#basic-tool-without-definecustomtool)
2. [Tool with `defineCustomTool` (Zod)](#tool-with-definecustomtool-zod)
3. [Factory Pattern](#factory-pattern)
4. [Full Project Structure](#full-project-structure)
5. [Migration from JS to TS](#migration-from-js-to-ts)
6. [Jest Test Example](#jest-test-example)
7. [Monorepo with Workspaces](#monorepo-with-workspaces)

---

## Basic Tool without `defineCustomTool`

**File:** `src/api-client.ts`

```typescript
interface ApiParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
}

module.exports.apiClient = {
  name: 'api_client',
  description: 'HTTP client (TypeScript version)',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL' },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET'
      },
      body: { type: 'object' }
    },
    required: ['url']
  },
  async execute(params: ApiParams) {
    // TypeScript knows params types
    const response = await fetch(params.url, {
      method: params.method,
      body: params.body ? JSON.stringify(params.body) : undefined
    });
    return response.json();
  }
};
```

**Use when:** You want type safety in `execute` but don't need Zod validation.

---

## Tool with `defineCustomTool` (Zod)

**File:** `src/api-client.ts`

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";

export default defineCustomTool({
  name: "api_client",
  description: "HTTP client with type-safe parameters",
  parameters: z.object({
    url: z.string().url().describe("API endpoint URL"),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
    body: z.object({}).passthrough().optional()  // any object
  }),
  async execute(args) {
    // TypeScript knows types from Zod!
    // args: { url: string; method?: 'GET'|'POST'|'PUT'|'DELETE'; body?: Record<string, any> }

    const response = await fetch(args.url, {
      method: args.method,
      body: args.body ? JSON.stringify(args.body) : undefined
    });
    return response.json();
  }
});
```

**Benefits:**
- Automatic validation via Zod
- Type inference (no manual interfaces)
- Hooks (`validate`, `postProcess`) available

---

## Factory Pattern

Create reusable client factories for shared configuration.

**File:** `lib/http-client.ts`

```typescript
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

**Usage in tools:**

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
```

---

## Full Project Structure

```
tools/
├── package.json
├── tsconfig.json
├── src/
│   ├── api-client.ts
│   ├── file-ops.ts
│   └── index.ts
├── dist/                 # compiled .js
└── node_modules/
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**src/index.ts:**

```typescript
export { apiClient } from './api-client';
export { fileOps } from './file-ops';
```

**package.json scripts:**

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest"
  }
}
```

---

## Migration from JS to TS

### Before (JS):

```javascript
module.exports.apiClient = {
  name: 'api_client',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string' }
    },
    required: ['url']
  },
  async execute(params) {
    return fetch(params.url);
  }
};
```

### After (TS with Zod):

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";

export default defineCustomTool({
  name: 'api_client',
  parameters: z.object({
    url: z.string().url()
  }),
  async execute(args) {
    return fetch(args.url);
  }
});
```

---

## Jest Test Example

**File:** `__tests__/api-client.test.ts`

```typescript
import apiClient from '../src/api-client';

describe('apiClient', () => {
  test('validates url', async () => {
    const result = await (apiClient as any).execute({});
    expect(result).toContain('url');
  });

  test('fetches data successfully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: 'test' })
    });

    const result = await (apiClient as any).execute({ url: 'https://api.example.com' });
    expect(result).toEqual({ data: 'test' });
    expect(fetch).toHaveBeenCalledWith('https://api.example.com', undefined);
  });
});
```

**Note:** `defineCustomTool` exports default object with `name`, `parameters`, `execute` fields. Access `.execute` directly in tests.

---

## Monorepo with Workspaces

**tools/package.json:**

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

**Structure:**

```
tools/
├── package.json
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

**tsconfig.base.json:**

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**packages/api-client/tsconfig.json:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

Install once at root:

```bash
cd tools
npm install  # installs deps for all packages
```

---

## Advanced Types (Reference)

### Discriminated Unions

```typescript
type Operation =
  | { type: 'read'; path: string }
  | { type: 'write'; path: string; content: string }
  | { type: 'delete'; path: string };

export default defineCustomTool({
  parameters: z.object({
    type: z.enum(['read', 'write', 'delete']),
    path: z.string(),
    content: z.string().optional()
  }).refine(
    (data) => data.type !== 'write' || !!data.content,
    { message: 'content required for write operations' }
  ),
  async execute(args) {
    switch (args.type) {
      case 'read': return readFile(args.path);
      case 'write': return writeFile(args.path, args.content);
      case 'delete': return unlink(args.path);
    }
  }
});
```

### Utility Types

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface Config {
  host: string;
  port: number;
  timeout: number;
}

type PartialConfig = Optional<Config, 'timeout'>;
// = { host: string; port: number; timeout?: number }
```

---

## Common Pitfalls

| Mistake | Wrong | Correct |
|---------|-------|---------|
| Module setting | `"module": "ESNext"` | `"module": "CommonJS"` |
| Missing interop | No `esModuleInterop` | `"esModuleInterop": true` |
| Import extension | `import './file'` | `import './file.js'` (ESM) or `require('./file')` (CJS) |
| Forgetting to build | Edit TS, no build | `npx tsc` before Refresh |
| zod not found | Import without install | `npm install @roo-code/types` |

---

## Performance Tips

- **Development:** Use `tsc --watch` for auto-recompilation
- **Production:** Bundle with esbuild for single-file distribution
- **Source maps:** Generate for debugging (`"sourceMap": true`)
- **Tree-shaking:** esbuild removes unused exports automatically
