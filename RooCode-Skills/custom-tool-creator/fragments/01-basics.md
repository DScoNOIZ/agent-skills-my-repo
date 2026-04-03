# 01-basics: Core Concepts

## What are Custom Tools

Custom Tools is an experimental Roo Code feature that allows creating custom tools in JavaScript/TypeScript. Tools are invoked like built-in ones (`read_file`, `execute_command`) and are used to standardize team workflows.

**Key capabilities:**
- Define tools in `.roo/tools/` (project) or `~/.roo/tools/` (global)
- Support for `.js` and `.ts` files
- Parameter validation via JSON Schema (JS) or Zod (TS)
- Automatic transpilation via esbuild
- **Auto-approve** — tools run without confirmation

## Enabling the Feature

1. Open Roo Code Settings (gear icon)
2. Go to **Experimental** tab
3. Toggle **Enable custom tools** = `true`
4. Restart VS Code window (Developer: Reload Window)

**Important:** When tools are enabled, they have **auto-approve**. Only enable for trusted code.

## Directories and Priority

```
<workspace>/.roo/tools/      # Priority: HIGH (overrides global)
~/.roo/tools/               # Priority: MEDIUM (personal, for all projects)
```

If a tool with the same `name` exists in both directories, `<workspace>/.roo/tools/` wins.

## Minimal File Structure

### JavaScript (CommonJS)

```javascript
module.exports.myTool = {
  name: 'my_tool',
  description: 'Brief description what this tool does and when to use it',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  },
  async execute(params) {
    return `Result: ${params.param1}`;
  }
};
```

### TypeScript (with defineCustomTool)

```typescript
import { parametersSchema as z, defineCustomTool } from "@roo-code/types";

export default defineCustomTool({
  name: "my_tool",
  description: "What the tool does (shown to AI)",
  parameters: z.object({
    param1: z.string().describe("Parameter description")
  }),
  async execute(args) {
    return `Result: ${args.param1}`;
  }
});
```

**Format details:** see [02-formats.md](02-formats.md)

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique tool identifier (lowercase, underscores). Visible in tools list. |
| `description` | string | Description for AI: what it does, when to use. Affects auto-selection. |
| `parameters` | object | JSON Schema (JS) or Zod schema (TS). Defines input parameters. |
| `execute` | async function | Function implementing the logic. Must return string (or object → JSON.stringify). |

## How Roo Loads Tools

1. On startup (or Refresh) Roo scans `.roo/tools/` and `~/.roo/tools/`
2. Finds all `.js` and `.ts` files
3. Transpiles TypeScript via esbuild (if `.ts`)
4. Loads modules as CommonJS
5. Looks for `module.exports.{toolName}` or `export default`
6. Validates schema and Execute signature
7. Registers tools in available tools list

**Refresh Tools:** Ctrl+Shift+P → "Custom Tools: Refresh". Always Refresh after file changes.

## Verifying Functionality

After creating the file:

```bash
# Check syntax
node --check ~/.roo/tools/my-tool.js

# Load module and verify exports
node -e "console.log(Object.keys(require('./my-tool.js')))"

# Execute the tool directly
node -e "require('./my-tool.js').myTool.execute({param1: 'test'}).then(console.log)"
```

In Roo Code: View → Output → "Roo Code" — look for loading errors.

## Next steps

- Study [formats](02-formats.md) and choose the right one (CommonJS recommended)
- Define your tool's [parameters](03-parameters.md)
- Implement [execute](04-execute.md) with best practices
- Check [security](05-security.md) before using
