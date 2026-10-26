# Custom Tools Format Specification

## Overview

This document describes the complete format specification for Roo Code Custom Tools, covering both JavaScript (CommonJS) and TypeScript (with defineCustomTool) implementations.

## 1. Module Loading

Roo Code loads Custom Tools using the following process:

1. Scan directories: `.roo/tools/` (project) and `~/.roo/tools/` (global)
2. Find all `.js` and `.ts` files
3. Transpile TypeScript via esbuild (if `.ts`)
4. Load modules as CommonJS
5. Extract tool definitions from exports
6. Validate schema and execute signature
7. Register tools in the available tools list

## 2. JavaScript (CommonJS) Format

### 2.1 Export Patterns

**Pattern A: Named exports**
```javascript
module.exports.myTool = {
  name: 'my_tool',
  description: '...',
  parameters: { ... },
  async execute(params) { ... }
};

module.exports.anotherTool = { ... };
```

**Pattern B: Object export**
```javascript
module.exports = {
  myTool: { ... },
  anotherTool: { ... }
};
```

**Important:** Do NOT use `exports.myTool = ...` (without `module.`). Use `module.exports` explicitly.

### 2.2 Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique tool identifier (lowercase, underscores, 1-64 chars) |
| `description` | string | Yes | Human-readable description shown to AI |
| `parameters` | object | Yes | JSON Schema (see section 2.3) |
| `execute` | async function | Yes | Main execution function |

### 2.3 JSON Schema for Parameters

The `parameters` field must be a valid JSON Schema object with:

```javascript
{
  type: 'object',              // Required, must be exactly 'object'
  properties: {                // Required, object defining each parameter
    paramName: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array',
      description: '...',      // Required for each property
      default: <value>,        // Optional default
      enum: ['a', 'b', 'c'],   // Optional enum
      minimum: 0,              // Optional (for numbers)
      maximum: 100,            // Optional (for numbers)
      minLength: 1,            // Optional (for strings)
      maxLength: 1000,         // Optional (for strings)
      pattern: '^[a-z]+$',     // Optional regex pattern (string)
      items: { type: 'string' } // Optional (for arrays)
    }
  },
  required: ['param1', 'param2']  // Optional array of required param names
}
```

### 2.4 Execute Signature

```javascript
async execute(params) {
  // params: object with validated parameters (defaults applied)
  // Must return: string (or object that can be JSON.stringify'd)
  // Must be async function (returns Promise)
}
```

## 3. TypeScript Format (defineCustomTool)

### 3.1 Import and Setup

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '.env') });
```

### 3.2 Tool Definition

```typescript
export default defineCustomTool({
  name: "my_tool",
  description: "...",

  parameters: z.object({
    param1: z.string().describe("..."),
    param2: z.number().min(1).max(100).default(10),
    mode: z.enum(['fast', 'normal', 'thorough']).default('normal')
  }),

  async execute(args) {
    // args is fully typed and validated
    return `result`;
  },

  // Optional lifecycle hooks
  validate?(params) { ... },
  postProcess?(result) { ... }
});
```

### 3.3 Compilation Requirements

- `tsconfig.json` must set `"module": "CommonJS"`
- Output directory should be `.roo/tools/` or `~/.roo/tools/` (compiled .js files)
- Roo loads the compiled .js, not the .ts source

Example tsconfig:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

## 4. Validation Rules

Roo Code validates each tool on load:

1. **name**: non-empty string, lowercase/underscore only (no spaces), 1-64 chars
2. **description**: non-empty string, max 1024 chars
3. **parameters**:
   - Must be object with `type: 'object'`
   - Must have `properties` object
   - Each property must have `type`
   - If `required` array exists, all items must be in `properties`
4. **execute**: must be a function and async (Promise-returning)
5. **No syntax errors** in the file

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial specification based on Roo Code experimental features |

## 6. See Also

- [fragments/02-formats.md](../fragments/02-formats.md) - Comparison of formats
- [fragments/03-parameters.md](../fragments/03-parameters.md) - Parameter schemas
- [fragments/04-execute.md](../fragments/04-execute.md) - Execute best practices
- Official documentation: https://docs.roocode.com/features/experimental/custom-tools
