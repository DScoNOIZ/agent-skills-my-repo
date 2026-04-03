# 3. TOOL SCRIPT

## Entry Point

Roo executes the file specified in `SKILL.md` under `implementation.file`.

### JavaScript

```javascript
// tool.js
module.exports = async function({ parameters, context }) {
  // Your code here
  return { result: 'Done' };
};
```

### TypeScript

```typescript
// tool.ts
import type { ToolContext } from 'roo';

export default async function({
  parameters,
  context
}: {
  parameters: Record<string, any>;
  context: ToolContext;
}) {
  // Your code here
  return { result: 'Done' };
}
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `parameters` | object | Validated input parameters from JSON schema |
| `context` | object | Execution context (vault, logger, etc.) |

## Return Value

Return a plain object. It will be converted to string for chat display.

```javascript
return {
  success: true,
  data: result,
  message: 'Operation completed'
};
```

## Error Handling

Throw errors for failure — Roo catches and displays them:

```javascript
throw new Error('Invalid input');
```

→ Next: [Parameters](./04-parameters.md) | [Dependencies](./05-dependencies.md)