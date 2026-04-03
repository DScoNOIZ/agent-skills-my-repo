# Debugging Custom Tools

Techniques for debugging Custom Tools when they fail or behave unexpectedly.

## Table of Contents

1. [Debugging Workflow](#debugging-workflow)
2. [Roo Code Logs](#roo-code-logs)
3. [Local Debugging](#local-debugging)
4. [Common Issues](#common-issues)
5. [Profiling](#profiling)
6. [Debugging Tips](#debugging-tips)

## Debugging Workflow

When a tool misbehaves:

1. **Check Roo Code logs** (View → Output → "Roo Code")
2. **Validate syntax**: `node --check tool.js` (JS) or `npx tsc` (TS)
3. **Test locally**: `node test_tools_interactively.js` or direct Node execution
4. **Add logging** and Refresh Custom Tools
5. **Simplify**: Strip down to minimal reproduction
6. **Review security checks**: Could input validation be blocking?
7. **Check Refresh**: Did you Refresh Custom Tools after changes?

## Roo Code Logs

### Accessing Logs

1. Open Roo Code
2. Menu: **View** → **Output**
3. Dropdown: select "Roo Code"
4. Logs show:
   - Tool loading errors (syntax, validation)
   - `console.log` and `console.error` from tool code
   - Execution errors (uncaught exceptions, timeouts)

### Increasing Log Verbosity

There's no global log level for Custom Tools. Use `console.log` liberally during development:

```javascript
async execute(params) {
  console.log('[MyTool] Received params:', JSON.stringify(params, null, 2));
  console.log('[MyTool] Environment:', { API_KEY: !!process.env.API_KEY });

  try {
    const result = await doWork(params);
    console.log('[MyTool] Success:', result);
    return result;
  } catch (error) {
    console.error('[MyTool] Error:', error);
    return `Error: ${error.message}`;
  }
}
```

**Remember:** Remove excessive logging before production, or guard with a log level:

```javascript
if (process.env.LOG_LEVEL === 'debug') {
  console.log('[MyTool] Params:', params);
}
```

## Local Debugging

### 1. Syntax Check

**JavaScript:**
```bash
node --check ~/.roo/tools/my-tool.js
# If no output, syntax is OK
```

**TypeScript:**
```bash
cd ~/.roo/tools
npx tsc --noEmit
```

### 2. Direct Execution

Run the tool directly with Node:

```bash
node -e "require('./my-tool.js').myTool.execute({param: 'value'}).then(console.log).catch(console.error)"
```

Or create a test script:

```javascript
// debug-test.js
const tools = require('./my-tool.js');

tools.myTool.execute({ test: 'input' })
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err));
```

```bash
node debug-test.js
```

### 3. Inspect Module Exports

Check what tools are exported from a file:

```bash
node -e "console.log(Object.keys(require('./my-tools.js')))"
```

Should output: `['tool1', 'tool2']`

### 4. Interactive Debugger

Use Node's built-in debugger:

```bash
node --inspect-brk debug-test.js
```

Then open `chrome://inspect` in Chrome and attach.

### 5. Debug TypeScript

For TypeScript tools, compile with source maps:

```bash
npx tsc --sourceMap
```

Then debug the compiled `.js` file with breakpoints mapped to `.ts`.

## Common Issues

### "Tool not found" after Refresh

**Symptoms:** Tool doesn't appear in "MCP: List Tools"

**Causes:**
1. Wrong export format (`exports.toolName` instead of `module.exports.toolName`)
2. Missing `execute` function
3. Syntax error in file
4. File not in correct directory (`.roo/tools/` or `~/.roo/tools/`)
5. File extension not `.js` or `.ts`

**Debug:**
```bash
node -e "try { require('./my-tool.js'); console.log('loaded OK'); } catch (e) { console.error(e); }"
```

### "Invalid parameters" error

**Symptoms:** Tool loads but can't be called; Roo says "Invalid parameters"

**Causes:**
1. `parameters.type` is not `'object'`
2. Missing `properties` object
3. Property missing `type` field
4. `required` array includes undefined property names

**Debug:**
- Open the file, check JSON Schema structure
- Use `validate_tools.js` to catch schema errors
- Validate JSON structure: https://jsonschemavalidator.byjg.com/

### Execute hangs or times out

**Symptoms:** Tool runs indefinitely or hits timeout

**Causes:**
1. Missing timeout on async operation
2. Infinite loop
3. Awaiting a promise that never resolves

**Debug:**
- Add logging before and after each async operation
- Add timeout wrapper:
  ```javascript
  const result = Promise.race([
    doWork(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
  ]);
  ```
- Check for missing `await` keywords

### "Cannot find module" error

**Symptoms:** Tool depends on external package that's not installed

**Causes:**
1. Package not in `node_modules`
2. Wrong `require()` path
3. TypeScript dependencies missing

**Debug:**
```bash
cd ~/.roo/tools
npm list <package-name>
```

If missing: `npm install <package-name>`

### Environment variables not available

**Symptoms:** `process.env.MY_KEY` is undefined

**Causes:**
1. `.env` file not created or not loaded (TS requires `dotenv.config()`)
2. Variable not defined in `.env`
3. `.env` in wrong directory (should be in tools dir or parent)

**Debug:**
```javascript
console.log('[Debug] Env vars:', Object.keys(process.env).filter(k => k.includes('MY')));
```

### Changes not taking effect

**Symptoms:** Edited tool but behavior unchanged

**Cause:** Custom Tools are cached; need Refresh

**Fix:** Ctrl+Shift+P → "Custom Tools: Refresh"

If that doesn't work, restart VS Code.

### TypeScript compilation errors

**Symptoms:** `.ts` file loads but throws errors

**Causes:**
1. `tsconfig.json` not configured with `"module": "CommonJS"`
2. Source `.ts` file not in `include` path
3. Missing `@roo-code/types` package

**Debug:**
```bash
cd ~/.roo/tools
npx tsc --noEmit --pretty false
```

Read all errors and fix them.

## Profiling

### Measuring Execution Time

```javascript
async execute(params) {
  const start = Date.now();

  // ... work ...

  const duration = Date.now() - start;
  console.log(`[MyTool] Took ${duration}ms`);

  return result;
}
```

### Memory Leak Detection

If tool memory usage grows over time (Roo restart clears it), suspect:

- Unbounded caches (use LRU or TTL)
- Accumulating arrays/objects without cleanup

Add memory logging:
```javascript
const used = process.memoryUsage();
console.log('[MyTool] Memory:', {
  rss: used.rss,
  heapTotal: used.heapTotal,
  heapUsed: used.heapUsed
});
```

## Debugging Tips

### 1. Start Minimal

Comment out all logic, return a simple string:
```javascript
async execute(params) {
  return 'debug: reachable';
}
```

If this works, gradually add back logic until it breaks.

### 2. Use Step-by-Step Logging

```javascript
async execute(params) {
  console.log('Step 1: validate');
  if (!params.url) return 'Error: url required';

  console.log('Step 2: check whitelist');
  if (!isValidUrl(params.url)) return 'Error: invalid url';

  console.log('Step 3: fetch');
  const response = await fetch(params.url, { signal: AbortSignal.timeout(30000) });

  console.log('Step 4: parse');
  const data = await response.json();

  console.log('Step 5: return');
  return data;
}
```

Check logs to see where it stops.

### 3. Compare With Working Example

If your tool fails but a known-good example works:

1. Compare export format (`module.exports.toolName` vs `module.exports = {...}`)
2. Compare `parameters` schema structure
3. Compare `execute` signature (async vs sync)
4. Use `diff` to find differences

### 4. Isolate the Problem

Create a minimal reproduction in a separate file:
```javascript
// minimal-test.js
const { myTool } = require('./my-tool.js');

myTool.execute({ test: 'input' })
  .then(console.log)
  .catch(console.error);
```

If minimal test works but Roo chat fails, the issue may be in how Roo calls the tool (parameter formatting, etc.).

### 5. Check Node Version

Custom Tools require Node.js 18+ (for `fetch`, `AbortSignal.timeout`).

Check version:
```bash
node --version
```

If using older Node, Roo Code may use its bundled version but it's good to know.

### 6. Validate with validate_tools.js

Run the validator to catch structural issues:
```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/my-tool.js
```

Fix all errors and warnings.

## Logging Best Practices

1. **Prefix logs** with tool name: `[MyTool]`
2. **Log at appropriate levels**:
   - `console.log` — general info, successful operations
   - `console.warn` — suspicious but non-fatal issues
   - `console.error` — failures, exceptions
3. **Avoid sensitive data** in logs (API keys, passwords)
4. **Structure logs** for readability:
   ```javascript
   console.log('[MyTool]', { action: 'fetch', url, status: response.status });
   ```

## Remote Debugging (Advanced)

If the tool interacts with external services:

1. **Enable service provider logs** (if available)
2. **Capture network traffic** with `mitmproxy` or `tcpdump`
3. **Use request IDs** to trace across systems:
   ```javascript
   const requestId = crypto.randomUUID();
   console.log(`[${requestId}] Request to ${url}`);
   ```

## When to Ask for Help

If you've tried the above and still stuck:

1. Create a **minimal reproduction** (strip tool to bare minimum that shows bug)
2. Check logs for **specific error messages**
3. Search issues on Roo Code GitHub: https://github.com/RooCodeInc/Roo-Code/issues
4. Ask in Roo Code Discord or community forums

Include in your question:
- Tool code (or minimal repro)
- Roo Code logs (relevant sections)
- What you expected vs what happened
- Steps to reproduce

## See Also

- [BEST_PRACTICES.md](BEST_PRACTICES.md) - General coding guidelines
- [TESTING.md](TESTING.md) - Systematic testing approaches
- [SECURITY.md](SECURITY.md) - Security-related debugging
