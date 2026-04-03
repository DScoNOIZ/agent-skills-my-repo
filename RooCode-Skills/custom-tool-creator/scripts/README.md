# Scripts for Custom Tools Development

This directory contains utilities for validating and testing Custom Tools.

## Contents

- `validate_tools.js` — static validation of tools
- `test_tools_interactively.js` — interactive test runner
- `create_test_suite.js` — Jest test boilerplate generation

## Installation

No separate installation required. Just run via Node.js:

```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/**/*.js
```

If additional dependencies are needed (e.g., for TypeScript), install them globally or in the tools directory:

```bash
npm install --global glob
```

## validate_tools.js

Validates Custom Tools before loading into Roo Code.

### What it checks

- Existence of `module.exports.{toolName}` or `export default`
- Required fields: `name`, `description`, `parameters`, `execute`
- `parameters.type === 'object'`
- `execute` is an async function
- Forbidden patterns: `import` in CJS, `eval()`, hardcoded secrets
- For Zod: schema correctness (if used)

### Usage

```bash
# Validate all tools in global directory
node validate_tools.js ~/.roo/tools/**/*.js

# Validate project-specific tools
node validate_tools.js ./.roo/tools/**/*.js

# Validate a specific file
node validate_tools.js ~/.roo/tools/api-client.js
```

### Example output

```
✓ ~/.roo/tools/api-client.js (apiClient)
  ✓ name: string (9 chars)
  ✓ description: string (42 chars)
  ✓ parameters: valid JSON Schema
  ✓ execute: async function

✗ ~/.roo/tools/bad-tool.js (badTool)
  ✗ Missing required field: description
  ✗ execute is not async (function)
```

### Exit codes

- `0` — all tools are valid
- `1` — there are errors (see output)

## test_tools_interactively.js

Interactive runner for manual tool testing.

### Usage

```bash
node test_tools_interactively.js ~/.roo/tools/api-client.js
```

### How it works

1. Loads the specified file
2. Finds all exported tools
3. For each tool:
   - Shows name and parameters (from JSON Schema)
   - Waits for JSON input from stdin
   - Calls `execute(params)`
   - Displays the result

### Example session

```
$ node test_tools_interactively.js ~/.roo/tools/api-client.js

Tool: api_client
Parameters:
{
  "url": "string (required)",
  "method": "string (optional, default: GET)",
  "body": "object (optional)"
}
Enter params (JSON): {"url": "https://api.example.com/health"}
Result: {"status":"ok","timestamp":"2024-01-15T10:30:00Z"}
```

### Exit

Press `Ctrl+C` to exit.

## create_test_suite.js

Generates Jest test boilerplate based on a tool.

### Usage

```bash
node create_test_suite.js ~/.roo/tools/api-client.js > __tests__/api-client.test.js
```

### What it generates

- `describe` block for the tool
- Tests for required parameter validation
- Tests for error handling (HTTP errors, timeout)
- Tests for happy path
- Mocks for fetch, fs, exec (depending on tool type)

### Setup

After generation:
1. Install Jest: `npm install --save-dev jest`
2. Configure `jest.config.js` if needed
3. Add script to `package.json`: `"test": "jest"`

## General tips

### During development

1. Create a tool → run `validate_tools.js`
2. Fix all validation errors
3. Run `test_tools_interactively.js` for quick testing
4. Write unit tests (use `create_test_suite.js` as a starting point)
5. Refresh Custom Tools in Roo
6. Test in chat

### CI/CD Integration

Add to workflow:

```yaml
- name: Validate tools
  run: node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js .roo/tools/**/*.js

- name: Run tests
  run: npm test
```

## Script requirements

- Node.js 18+ (for built-in `fetch`, `AbortSignal.timeout`)
- For TypeScript: `tsc` must compile before validation
- For tools with dependencies: `npm install` in the tools directory

## Debugging validation errors

If `validate_tools.js` reports an error:

1. **Missing required field** — check that the tool object has `name`, `description`, `parameters`, `execute`
2. **execute is not async** — ensure `execute: async function(params) { ... }`
3. **Invalid JSON Schema** — check parameters syntax (must be `{ type: 'object', properties: {...} }`)
4. **Cannot find module** — file not found or no read permissions

More about the format: see [fragments/02-formats.md](../fragments/02-formats.md)

---

**These scripts are part of the `custom-tool-creator` skill. For complete documentation see SKILL.md.**
