# 11-typescript: TypeScript for Custom Tools (Conceptual Guide)

TypeScript adds static typing and better developer experience, but requires additional setup and build steps.

## When to Use TypeScript

| Situation | Recommendation | Rationale |
|-----------|----------------|-----------|
| Simple tool (<50 lines) | JavaScript (CommonJS) | Lower overhead, no compilation |
| >5 tools in project | TypeScript | Type safety across modules |
| Complex types between tools | TypeScript | Interface contracts prevent bugs |
| Reuse outside Roo Code (MCP, npm) | TypeScript | Consumer expects types |
| Team already uses TypeScript | TypeScript | Consistency |

**80/20 rule:** 80% of tools can be written in JavaScript. Use TypeScript for large, complex tool suites.

## Core Concepts

### Why TypeScript?

- **Compile-time errors** catch mistakes before runtime
- **Autocomplete** improves developer experience
- **Refactoring safety** across multiple files
- **Self-documenting code** through types

### Trade-offs

- Build step required (`tsc` or bundler)
- Source maps needed for debugging
- ESM/CJS compatibility issues
- More initial setup

## Setup Overview

1. Install dependencies: `typescript`, `@roo-code/types` (if using `defineCustomTool`)
2. Create `tsconfig.json` with `"module": "CommonJS"`
3. Structure: `src/` → `dist/`
4. Build before every tool refresh

**Key tsconfig options:**

| Option | Value | Why |
|--------|-------|-----|
| `module` | `CommonJS` | Roo expects CommonJS |
| `target` | `ES2022` | Modern features |
| `strict` | `true` | All type checks enabled |
| `esModuleInterop` | `true` | Allows `import axios from 'axios'` |
| `outDir` | `./dist` | Separate compiled output |
| `sourceMap` | `true` | Debug original TS |

### Project Structure

```
~/.roo/tools/
├── package.json
├── tsconfig.json
├── src/
│   ├── api-client.ts
│   ├── file-ops.ts
│   └── index.ts          # exports all tools
├── dist/                 # compiled .js files
└── node_modules/
```

**src/index.ts:**

```typescript
export { apiClient } from './api-client';
export { fileOps } from './file-ops';
```

Roo loads `dist/index.js` after compilation.

## Format Options

### 1. CommonJS without `defineCustomTool`

Write TypeScript that compiles to CJS, export `module.exports`.

**Pros:** Simple, full control
**Cons:** Manual JSON Schema, no advanced hooks

### 2. `defineCustomTool` with Zod (Recommended)

Use `@roo-code/types` for Zod-based schema + type inference.

**Pros:** Auto-validation, type-safe, hooks available
**Cons:** Extra dependency

### 3. Hybrid: Named exports + default aggregator

Combine multiple named exports into a default object.

```typescript
export { apiClient } from './api-client';
export { fileOps } from './file-ops';

export default {
  apiClient: require('./api-client').default,
  fileOps: require('./file-ops').default
};
```

## Type System Essentials

### Built-in Types

- Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- Complex: `string[]`, `Record<string, number>`, `[string, number]` (tuples)

### Interfaces vs Types

```typescript
interface ToolParams { url: string; timeout?: number; }
type ToolParams = { url: string; timeout?: number; }  // similar
```

Use `interface` for object shapes, `type` for unions/mapped types.

### Type Inference from Zod

```typescript
const schema = z.object({
  name: z.string(),
  age: z.number().int()
});

type Params = z.infer<typeof schema>;  // { name: string; age: number }
```

No need to manually duplicate types when using `defineCustomTool`.

## Advanced Types (Quick Reference)

- **Discriminated unions:** Tagged variants (`{type: 'read', path: string}`) for exhaustive checking
- **Generics:** `function createTool<T>()` for reusable logic
- **Utility types:** `Partial<T>`, `Pick<T, K>`, `Omit<T, K>` for transformations

See `references/TYPESCRIPT_EXAMPLES.md` for complete code.

## CommonJS vs ES Modules

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Module setting | `"module": "CommonJS"` | `"module": "ESNext"` |
| Roo compatibility | ✅ Native | ❌ Needs bundling |
| Dynamic import | Possible (require) | Native (`import()`) |

**Recommendation:** Use CommonJS to avoid bundling complexity.

## Compilation Strategies

- **Development:** `tsc --watch` → auto-recompile on save
- **Production:** Bundle with esbuild/webpack for single-file distribution
- **Testing:** `tsc --noEmit` for type checking only

### Build Commands

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "type-check": "tsc --noEmit"
  }
}
```

**Workflow:** Edit → `npx tsc` → Refresh Custom Tools.

### Bundling

For many tools with shared dependencies, bundle to reduce file count:

```bash
npm install --save-dev esbuild
```

**esbuild.config.js:**

```javascript
require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node18',
  external: ['@roo-code/types']  // keep external if using defineCustomTool
}).catch(() => process.exit(1));
```

**Pros:** Single file, faster loading. **Cons:** Harder to debug.

## Debugging

- Enable `"sourceMap": true` in `tsconfig.json` for stack traces showing original TS
- Use `ts-node` for rapid iteration without separate build step
- Check compiled `.js` in `dist/` if Roo fails to load

## Common Pitfalls

| Mistake | ❌ Wrong | ✅ Correct |
|---------|---------|-----------|
| Module setting | `"module": "ESNext"` | `"module": "CommonJS"` |
| Missing interop | No `esModuleInterop` | `"esModuleInterop": true` |
| Import extension | `import './file'` | `import './file.js'` or `require('./file')` |
| Forgetting build | Edit TS, no build | `npx tsc` before Refresh |
| zod missing | Import without install | `npm install @roo-code/types` |

## Production Checklist

- [ ] `tsconfig.json` has `"module": "CommonJS"`
- [ ] `npx tsc --noEmit` shows no type errors
- [ ] `dist/` contains all compiled `.js` files
- [ ] Source maps generated (`"sourceMap": true`)
- [ ] Dependencies in `package.json` (not `devDependencies`)
- [ ] `@roo-code/types` installed if using `defineCustomTool`
- [ ] Bundle if >3 tools (optional, for performance)
- [ ] `.env` configured and in `.gitignore`
- [ ] Refresh Custom Tools works without errors
- [ ] Logs show JS lines (types stripped in production)

## Migration: JavaScript → TypeScript

1. Add `tsconfig.json` (`npx tsc --init`)
2. Rename files: `.js` → `.ts`
3. Replace JSON Schema with Zod (if using `defineCustomTool`) or add interfaces
4. Fix compilation errors (`npx tsc`)
5. Build: `npx tsc`
6. Refresh Custom Tools

**Example conversion:**

```javascript
// JS
module.exports.apiClient = {
  name: 'api_client',
  parameters: { type: 'object', properties: { url: { type: 'string' } } },
  async execute(params) { return fetch(params.url); }
};
```

```typescript
// TS with Zod
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";

export default defineCustomTool({
  name: 'api_client',
  parameters: z.object({ url: z.string().url() }),
  async execute(args) { return fetch(args.url); }
});
```

Complete examples: `references/TYPESCRIPT_EXAMPLES.md`.

## Testing TypeScript Tools

- Use `ts-jest` for Jest integration
- Access `.execute` directly on the default export
- Mock external dependencies (fetch, fs) with `jest.fn()`

## TypeScript + Jest Setup

```bash
npm install --save-dev jest ts-jest @types/jest
npx ts-jest config:init
```

**jest.config.js:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts']
};
```

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Zod documentation: https://zod.dev/
- tsconfig reference: https://www.typescriptlang.org/tsconfig

---

**Next:** For patterns organizing multiple tools, read [12-multi-tools.md](fragments/12-multi-tools.md). Refer to `references/TYPESCRIPT_EXAMPLES.md` for complete code samples.
