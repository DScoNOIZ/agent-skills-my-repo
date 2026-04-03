# 02-formats: Tool Formats Comparison

There are three main approaches to creating Custom Tools:

1. **CommonJS (JavaScript)** — simple object export
2. **ES Modules (TypeScript/JavaScript)** — with imports
3. **defineCustomTool** — using `@roo-code/types`

## Comparison Table

| Criterion | CommonJS (JS) | ES Modules (TS/JS) | defineCustomTool |
|-----------|---------------|-------------------|------------------|
| **Complexity** | Minimal (only `module.exports`) | Medium (requires build) | Medium (dependency `@roo-code/types`) |
| **Dependencies** | None | None (if pure TS) | `npm install @roo-code/types` |
| **Typing** | None | TypeScript types | Zod schema with type inference |
| **Validation** | JSON Schema manually | JSON Schema manually | Zod → automatic |
| **Build** | Not needed | `tsc` → CommonJS | `tsc` → CommonJS (if TS) |
| **Best for** | 90% of cases, simple tools | Large projects with TS | Complex validation, reuse in MCP |

## Recommendation

**Use JavaScript (CommonJS) by default.** Reasons:
- No dependencies or compilation required
- Works immediately after file creation
- Sufficient for most use cases (API clients, file operations, system commands)
- Simpler debugging (readable stack traces)

**Use TypeScript + defineCustomTool only if:**
- Large project (>5 tools) — types help maintainability
- Need advanced lifecycle hooks (`validate`, `postProcess`)
- Planning to reuse code in other MCP projects

## CommonJS (JavaScript) — Recommended

**File structure:**

```javascript
module.exports.myTool = {
  name: 'my_tool',
  description: 'Brief description what this tool does and when to use it',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' },
      param2: {
        type: 'number',
        default: 10,
        minimum: 0,
        maximum: 100,
        description: 'Optional number (0-100), default 10'
      },
      config: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Server host' },
          port: { type: 'number', default: 8080 }
        },
        required: ['host']
      }
    },
    required: ['param1']
  },
  async execute(params) {
    // Parameters are already validated by Roo
    // params === { param1: string, param2?: number, config?: {host: string, port?: number} }

    if (!params.param1) {
      return 'Error: param1 is required';  // Additional validation
    }

    try {
      const result = await doSomething(params.param1, params.param2);
      return `Success: ${result}`;
    } catch (error) {
      console.error('[MyTool] Error:', error);
      return `Error: ${error.message}`;
    }
  }
};
```

**Exporting multiple tools:**

```javascript
module.exports = {
  tool1: { name: 'tool1', description: '...', parameters: {...}, async execute(params) {...} },
  tool2: { name: 'tool2', description: '...', parameters: {...}, async execute(params) {...} }
};
```

**Verify exports:**

```bash
node -e "console.log(Object.keys(require('./my-tools.js')))"
# [ 'tool1', 'tool2' ]
```

## TypeScript with defineCustomTool

**Dependencies setup:**

```bash
cd ~/.roo/tools
npm init -y
npm install @roo-code/types
npm install --save-dev typescript
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**src/my-tool.ts:**

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";

export default defineCustomTool({
  name: "my_tool",
  description: "What the tool does (shown to AI)",
  parameters: z.object({
    param1: z.string().describe("Parameter description"),
    param2: z.number().min(0).max(100).default(10),
    config: z.object({
      host: z.string(),
      port: z.number().default(8080)
    }).optional()
  }),
  async execute(args) {
    // TypeScript automatically knows args types
    // args: { param1: string; param2?: number; config?: { host: string; port?: number } }

    try {
      const result = await doSomething(args.param1, args.param2);
      return `Success: ${result}`;
    } catch (error: any) {
      console.error('[MyTool] Error:', error);
      return `Error: ${error.message}`;
    }
  }
});
```

**Build and deployment:**

```bash
npx tsc                    # compiles to dist/
# Roo loads dist/*.js
```

**Hot reload:** After changes — Ctrl+Shift+P → Refresh Custom Tools.

## TypeScript without defineCustomTool

You can write TypeScript without `@roo-code/types` by simply exporting a CommonJS object:

```typescript
// my-tool.ts
interface ToolParams {
  param1: string;
  param2?: number;
}

module.exports.myTool = {
  name: 'my_tool',
  description: 'Tool written in TS without defineCustomTool',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '...' },
      param2: { type: 'number' }
    },
    required: ['param1']
  },
  async execute(params: ToolParams) {
    return `Result: ${params.param1}`;
  }
};
```

Compile with `tsc` → Roo loads `.js`. TypeScript provides typing but not Zod validation.

## ES Modules (JavaScript)

If you want to use ES module syntax (`import/export`) in JavaScript:

```javascript
// my-tool.js (ESM)
import { readFile } from 'fs/promises';

export default {
  name: 'my_tool',
  description: 'ESM tool',
  parameters: { /* ... */ },
  async execute(params) {
    return 'result';
  }
};
```

**Important:** Roo transpiles via esbuild and loads as CommonJS. This approach works but may be harder to debug. CommonJS is recommended.

## Parameter Formats: JSON Schema vs Zod

**JSON Schema (JS):**

```javascript
parameters: {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      format: 'uri',           // URL validation
      description: 'API endpoint'
    },
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    },
    body: {
      type: 'object',
      description: 'JSON request body'
    }
  },
  required: ['url']
}
```

**Zod (TS with defineCustomTool):**

```typescript
parameters: z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  body: z.object({ title: z.string() }).optional()
})
```

**Zod advantages:**
- Chainable validation (`.url()`, `.email()`, `.min()`, `.max()`)
- Type inference — TypeScript automatically determines types
- More readable code

## When to Choose What

| Scenario | Format |
|----------|--------|
| Simple API client (<50 lines) | CommonJS |
| File operations (read/write/rename) | CommonJS |
| System commands (git, docker) | CommonJS |
| Tool with configuration (.env, API keys) | CommonJS + .env |
| Large project (10+ tools) | TypeScript + defineCustomTool |
| Need advanced hooks (validate, postProcess) | defineCustomTool |
| Reuse code in MCP or npm package | TypeScript |

## Common Pitfalls

**❌ Using ESM syntax (import/export) in CommonJS:**
```javascript
// BAD
import fs from 'fs';
module.exports = { ... };

// GOOD
const fs = require('fs');
module.exports = { ... };
```

**❌ Specifying `"type": "module"` in package.json:**
Roo expects CommonJS. Set `"type": "commonjs"` or omit the field.

**❌ Missing `async` on execute:**
```javascript
// BAD
execute(params) { ... }

// GOOD
async execute(params) { ... }
```

**❌ Incorrect export:**
```javascript
// BAD (exports object with myTool field, not the tool itself)
module.exports = { myTool: { name: '...', ... } };

// GOOD (if name='myTool' and accessed via .myTool)
module.exports.myTool = { name: 'myTool', ... };
```

## Migrating from JS to TS

1. Create `tsconfig.json` in tools directory
2. Rename `.js` → `.ts`
3. Add `import { defineCustomTool } from "@roo-code/types"` (optional)
4. Run `npx tsc`
5. Ensure Roo loads generated `.js` (not `.ts`)
6. Refresh Custom Tools

**Spoonful of sugar:** Start with JS. Switch to TS only if you need typing and lots of code.

## Production Choice

For production-readiness in a team:

- **Beginners** → CommonJS (easier to start)
- **Experienced** → TypeScript + defineCustomTool (security, type safety)
- **Teams** → Unified standard (all JS or all TS) for consistency

See also [14-checklists.md](13-checklists.md) for the full production checklist.
