# 03-parameters: Tool Parameters

Parameters define what data the AI passes to the tool. The format depends on the chosen approach:

- **JavaScript**: JSON Schema (standard)
- **TypeScript + defineCustomTool**: Zod schema (converted to JSON Schema)

## Required Structure

All formats require:

```javascript
parameters: {
  type: 'object',
  properties: { ... },
  required: [...]    // optional
}
```

## Available Types (JSON Schema)

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text | `{ type: 'string', description: 'File name' }` |
| `number` | Float | `{ type: 'number', minimum: 0, maximum: 100 }` |
| `integer` | Integer | `{ type: 'integer' }` |
| `boolean` | Boolean | `{ type: 'boolean', default: false }` |
| `object` | Nested object | `{ type: 'object', properties: { ... } }` |
| `array` | Array | `{ type: 'array', items: { type: 'string' } }` |
| `null` | null | `{ type: 'null' }` |

## String Validation

```javascript
{
  type: 'string',
  minLength: 1,        // minimum 1 character
  maxLength: 1000,     // maximum 1000 characters
  pattern: '^[a-zA-Z0-9_]+$',  // regex
  format: 'email',     // special formats (email, uri, date-time)
  description: 'User email'
}
```

**Formats:** `email`, `uri`, `date`, `date-time`, `hostname`, `ipv4`, `ipv6`.

## Number Validation

```javascript
{
  type: 'number',
  minimum: 0,          // >= 0
  maximum: 100,        // <= 100
  exclusiveMinimum: 0, // > 0
  exclusiveMaximum: 100, // < 100
  multipleOf: 0.01,    // step (for money)
  description: 'Percentage (0-100)'
}
```

## Boolean

```javascript
{
  type: 'boolean',
  default: false,
  description: 'Enable flag'
}
```

## Enum (enumerations)

```javascript
{
  type: 'string',
  enum: ['GET', 'POST', 'PUT', 'DELETE'],
  default: 'GET',
  description: 'HTTP method'
}
```

## Array

```javascript
{
  type: 'array',
  items: {
    type: 'string',
    description: 'File name'
  },
  minItems: 1,
  maxItems: 100,
  uniqueItems: true,
  description: 'List of files to process'
}
```

## Nested objects

```javascript
{
  type: 'object',
  properties: {
    host: { type: 'string', description: 'Server hostname' },
    port: { type: 'integer', minimum: 1, maximum: 65535, default: 8080 },
    ssl: { type: 'boolean', default: true }
  },
  required: ['host'],
  additionalProperties: false  // forbid undeclared fields
}
```

## Default values

```javascript
{
  param1: {
    type: 'string',
    default: 'localhost'  // if param1 not provided, defaults to 'localhost'
  }
}
```

In `execute` you'll receive: `params.param1 === 'localhost'`.

## Required fields

```javascript
parameters: {
  type: 'object',
  properties: {
    url: { type: 'string' },
    method: { type: 'string', default: 'GET' }
  },
  required: ['url']  // only url is required
}
```

If AI sends `{ method: 'POST' }` without `url` — Roo returns validation error before calling `execute`.

## Zod (TypeScript)

**Zod advantages:**
- Chainable validation
- Type inference — TypeScript knows `args` types in `execute`
- Convenient utilities (`.optional()`, `.default()`)

**Zod example:**

```typescript
parameters: z.object({
  // Required string
  url: z.string().url().describe("API endpoint (must be valid URL)"),

  // Optional number with default
  timeout: z.number().int().positive().default(30000),

  // Enum
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),

  // Nested object
  config: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535).default(8080)
  }).optional(),

  // Array
  files: z.array(z.string()).max(100).describe("File paths"),

  // Record (free-form object)
  headers: z.record(z.string()).optional()
})
```

**Zod modifiers:**

| Modifier | Description |
|----------|-------------|
| `.optional()` | parameter not required |
| `.default(value)` | default value |
| `.nullable()` | can be null |
| `.describe("text")` | description for AI |
| `.email()` | email validation |
| `.url()` | URL validation |
| `.uuid()` | UUID validation |
| `.min(n)` / `.max(n)` | number/string/array limits |
| `.regex(pattern)` | regular expression |
| `.transform(fn)` | value transformation |

## Complex examples

### **Git commit tool**

```javascript
{
  type: 'object',
  properties: {
    message: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'Commit message'
    },
    branch: {
      type: 'string',
      pattern: '^main$|^master$|^feature/',
      description: 'Branch name (main, master, feature/...)'
    },
    amend: {
      type: 'boolean',
      default: false,
      description: 'Amend previous commit'
    }
  },
  required: ['message']
}
```

### **Batch file processor**

```javascript
{
  type: 'object',
  properties: {
    directory: {
      type: 'string',
      default: '.',
      description: 'Working directory'
    },
    pattern: {
      type: 'string',
      description: 'Glob pattern (e.g., "*.txt")'
    },
    operation: {
      type: 'string',
      enum: ['read', 'write', 'rename', 'delete'],
      default: 'read'
    },
    content: {
      type: 'string',
      description: 'Content for write operation'
    }
  },
  required: ['pattern', 'operation']
}
```

## Validation Flow

1. **Roo receives tool call** from AI with parameters
2. **Roo validates** against `parameters` schema (JSON Schema or Zod)
3. **If validation passes** — calls `execute` with validated parameters
4. **If fails** — returns error to AI (tool not invoked)

**You still must validate inside `execute`** (defense in depth) because:
- AI may not send all fields (even if required)
- Values can be borderline (very long strings, huge numbers)
- Business logic validation needed (e.g., "if operation=write, content required")

## Defense in Depth

```javascript
async execute(params) {
  // Additional validation (after JSON Schema)
  if (params.operation === 'write' && !params.content) {
    return 'Error: content required for write operation';
  }

  if (params.pattern.includes('..')) {
    return 'Error: parent directory traversal not allowed';
  }

  // Main logic
  return processFiles(params);
}
```

## Parameter Design Tips

1. **Clear names** — `filePath`, not `fp`
2. **Descriptive descriptions** — AI sees them to understand when to call the tool
3. **required only for truly essential** — fewer required = more flexible
4. **default values** — make the tool convenient
5. **Limit sizes** — `maxLength`, `maxItems` for DoS protection
6. **Enum instead of string** — when there's a fixed set of values
7. **Nested objects** — group related parameters

## Bad Parameter Design Examples

**❌ Too many required:**

```javascript
required: ['a', 'b', 'c', 'd', 'e', 'f']  // 6 required — hard to use
```

**❌ Unclear names:**

```javascript
{ type: 'string', description: 'Param 1' }  // What is Param 1?
```

**❌ No limits:**

```javascript
{ type: 'string' }  // Could be 10MB string — DoS!
```

**✅ Good:**

```javascript
{
  type: 'object',
  properties: {
    filePath: {
      type: 'string',
      minLength: 1,
      maxLength: 1000,
      description: 'Path to file within workspace'
    },
    encoding: {
      type: 'string',
      enum: ['utf-8', 'utf-16', 'ascii'],
      default: 'utf-8'
    }
  },
  required: ['filePath']
}
```

## Zod vs JSON Schema

**Use Zod if:**
- Writing TypeScript and want type inference
- Need complex validation chain (`z.string().email().max(100)`)
- Using `defineCustomTool`

**Use JSON Schema if:**
- Writing JavaScript
- Simple validation
- No dependencies wanted

**Equivalence:**

```typescript
// Zod
z.object({
  email: z.string().email().max(100),
  age: z.number().int().min(0).max(150)
})

// JSON Schema
{
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 100 },
    age: { type: 'integer', minimum: 0, maximum: 150 }
  }
}
```

## Testing Parameters

Test edge cases:

```javascript
// 1. Missing required parameters
await tool.execute({});  // Should return error

// 2. Wrong types
await tool.execute({ count: 'not a number' });  // error

// 3. Boundary values
await tool.execute({ text: 'a'.repeat(10000) });  // exceeds maxLength?

// 4. null/undefined
await tool.execute({ param: null });  // allowed?

// 5. Enum values
await tool.execute({ method: 'INVALID' });  // only GET/POST/etc
```

## Schema Validation

The `validate_tools.js` validator (see [scripts/README.md](../scripts/README.md)) checks:

- `parameters` exists and has `type: 'object'`
- All `properties` have `type`
- `required` contains only existing property names
- No circular references in schema
- For Zod: correctness of `.describe()`, `.default()` calls

---

**Next steps:** After defining parameters, implement [execute](04-execute.md) with best practices.
