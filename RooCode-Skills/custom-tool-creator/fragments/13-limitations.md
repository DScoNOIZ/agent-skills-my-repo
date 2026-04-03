# 12-limitations: Custom Tools Limitations

Custom Tools is an experimental feature with important constraints to consider during design.

## Security

### Auto-approve

When Custom Tools are enabled, Roo executes them **without user confirmation**.

**Implications:**
- Any tool you write will run automatically when AI calls it
- If a tool has a bug (e.g., `rm -rf /`), it executes without stopping
- Enable Custom Tools **only for trusted code**
- In teams: only senior developers should create/edit tools

**Workaround:** Disable Custom Tools when not developing, or use `Custom Tools Require Approval = true` (if available in future versions).

### No sandbox

Tools run in the same context as Roo Code extension:
- Full filesystem access (including outside workspace if unchecked)
- Unrestricted network (unless you implement SSRF protection)
- Access to `process.env` (including secrets)

**Do not expect isolation.** You are responsible for protection (see [05-security.md](05-security.md)).

## API Limitations

### String-only results

Roo protocol expects a string as tool result:

```javascript
// ✅ OK
return 'Success';
return JSON.stringify(result);
return `Count: ${count}`;

// ⚠️ Works but auto-stringified
return { success: true, count: 42 };
// Roo receives: '{"success":true,"count":42}'

// ❌ NOT supported
return fs.createReadStream('file.txt');  // Stream
return Buffer.from('data');             // Buffer
return new Response();                  // Web API Response
```

**For binary data, use base64:**

```javascript
const content = await fs.readFile('image.png');
return { content: content.toString('base64'), encoding: 'base64' };
```

### No streaming

No chunked responses. The entire result must be ready when `execute` resolves.

**Cannot:**
- Show real-time progress
- Return partially ready result and continue

**Workaround:** For long operations (>10s), break into stages:

```javascript
// Tool 1: startLongProcess → returns jobId
// Tool 2: getJobStatus(jobId) → returns progress
// AI calls sequentially
```

### No interactive prompts

A tool **cannot** ask the user during execution.

**❌ Impossible:**

```javascript
async execute(params) {
  const answer = await askUser('Continue?');  // No!
  // ...
}
```

**Workaround:** All input must come via parameters. If clarification is needed, AI asks the user *before* calling the tool.

## Development & Debugging

### No hot reload

After changing a tool file, Roo **does not automatically reload** it.

**Required:** Ctrl+Shift+P → "Custom Tools: Refresh"

**Workaround:** You can write a script that watches files and triggers Refresh via VS Code command (advanced).

### Cache invalidation

Roo caches transpiled tools. Sometimes after changes you need:
1. Refresh Custom Tools
2. If not working → Reload Window (Developer: Reload Window)
3. Still not working → restart VS Code

### Limited debugging

No built-in debugger for Custom Tools.

**Available methods:**
1. `console.log` → View → Output → "Roo Code"
2. Run tool directly via Node (see [07-deployment.md](07-deployment.md))
3. External debugger: `node --inspect-brk tool.js` (not integrated with Roo)

**Not available:**
- Breakpoints in VS Code when called from Roo
- Step-through debugging
- Watch expressions

### Stack traces

If `execute` throws (does not return error), Roo crashes. Stack trace may be truncated or unreadable due to transpilation.

**Always:** return error messages instead of throwing.

## Performance

### Startup time

When Custom Tools are enabled, Roo:
1. Scans `.roo/tools/` and `~/.roo/tools/`
2. Transpiles TypeScript (if `.ts`)
3. Loads modules (require)
4. Validates schema

**Many tools (>20) or large dependencies can add seconds to startup.**

**Optimization:**
- Bundle tools into one file (esbuild)
- Minimize dependencies
- Use CommonJS instead of ESM

### Memory leaks

Module-level state lives in Roo memory between calls:

```javascript
let counter = 0;  // lives in Roo memory

module.exports.tool = {
  async execute() {
    counter++;  // accumulates
    return counter;
  }
};
```

Many stateful tools increase memory usage. Roo does not unload tools until window closes.

**Solution:**
- Prefer stateless tools
- If state is needed, use external storage (Redis, file)
- Limit cache sizes (LRU, TTL)

### No worker threads

Tools run in Roo Code main thread. Long computations block UI.

**Avoid:**
- CPU-intensive tasks (large file processing, image manipulation)
- Infinite loops

**Workaround:** Break into chunks, or use `child_process` for heavy lifting.

## Security (Protection Gaps)

### No built-in SSRF protection

Roo does not validate URLs automatically. You are responsible.

**Example vulnerability:**

```javascript
// Without whitelist, AI might call:
await tool.execute({ url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/' });
```

**Solution:** Implement validation in each tool (see [05-security.md](05-security.md)).

### No filesystem sandbox

Roo does not restrict filesystem access outside workspace.

**Example:**

```javascript
await tool.execute({ path: '../../../etc/passwd' });  // Can read!
```

**Solution:** Workspace restriction (see [05-security.md](05-security.md)).

### No command allowlist

Roo does not block dangerous commands. You are responsible.

**Example:**

```javascript
await tool.execute({ command: 'rm -rf /' });  // Catastrophe!
```

**Solution:** Command whitelist (see [05-security.md](05-security.md)).

## Multi-editor Scenarios

### Conflicts with other tools

If two tools have the same `name`, the one that loads later wins (order depends on file scanning).

**Best practice:** Use unique names with prefixes:

```javascript
name: 'myproject_api_get_users'
name: 'myproject_file_read'
```

### MCP vs Custom Tools

Custom Tools cannot provide resources like MCP servers. Only tools (functions).

If you need resources (files, data), use MCP.

## TypeScript Limitations

### No incremental compilation

Roo transpiles via esbuild, no incremental builds. Each Refresh transpiles all files.

**Large TS projects (>100 files) can be slow.** Bundle them.

### Source maps do not always work

Stack traces in Roo Code Output may show dist/*.js instead of source .ts. Source maps sometimes fail to load.

**Workaround:** Log file and line manually:

```typescript
console.log(`[MyTool] At ${__filename}:${new Error().stack.split('\n')[1]}`);
```

### No type checking in Roo

TypeScript types are checked only at compile time (`npx tsc`). Roo does not run type checker.

**Do not rely on runtime type safety.** TypeScript is development-time only.

## Environment & Dependencies

### .env loading only with defineCustomTool

For CommonJS tools, `.env` is not auto-loaded. You must use `dotenv` explicitly (see [09-environment-variables.md](09-environment-variables.md)).

### Dependencies must be local

Run `npm install` inside `~/.roo/tools/` or `.roo/tools/`. Global packages are not visible.

### No peer-dependencies resolution

If two tools require different versions of the same library, conflicts may occur. Manually install a compatible version.

## Testing Limitations

### Cannot test in Roo directly

No way to invoke a tool with specific parameters via UI (except chat). No test harness inside Roo.

**Workaround:** Use `test_tools_interactively.js` or unit tests.

### Mocking Roo context

Cannot easily mock `context` parameter in tests. You must pass the object manually:

```javascript
await tool.execute(params, { mode: 'code', task: { id: 'test' } });
```

## Production Concerns

### No versioning

Tools have no versions. Updating the file is instant, but no way to roll back to a specific version.

**Workaround:** Use Git for file versioning. Or name tools with versions: `my_tool_v1`, `my_tool_v2`.

### No metrics

Roo does not collect tool call metrics (invocation count, duration, errors). No built-in monitoring.

**Workaround:** Implement custom logging:

```javascript
async execute(params) {
  const start = Date.now();
  try {
    const result = await doWork(params);
    console.log(`[Metric] ${name} success ${Date.now() - start}ms`);
    return result;
  } catch (error) {
    console.error(`[Metric] ${name} error: ${error.message}`);
    return `Error: ${error.message}`;
  }
}
```

### No access control

Anyone with workspace access can create/edit tools in `.roo/tools/`. No authentication/authorization.

**In teams:** Code review is mandatory for all changes in `.roo/tools/`.

## Roadmap & Known Issues

Watch GitHub issues:
- https://github.com/RooCodeInc/Roo-Code/issues?q=is%3Aopen+custom+tools

Known limitations (as of Feb 2026):
- Auto-approve cannot be disabled per-tool
- No tool discovery (UI showing descriptions)
- No parameter hints (autocomplete for parameters in chat)
- No per-project tool disable/enable

## Workarounds Summary

| Limitation | Workaround |
|------------|------------|
| No hot reload | Refresh Custom Tools after each change |
| String-only results | JSON.stringify objects, base64 for binary |
| No interactive prompts | All validation before call, or multi-step workflow |
| No sandbox | Implement security checks (whitelist, path checks) |
| Auto-approve | Enable only while developing, disable after |
| Memory leaks | Stateless design, external cache with TTL |
| Slow TS startup | Bundle, minimize dependencies |
| No versioning | Git, filename version suffixes |
| No metrics | Custom console logging |

## When NOT to use Custom Tools

- **Critical operations** (deploy, backups) — require approval, use manual workflow
- **Interactive CLI** — no stdin, use regular scripts
- **Long-running (>5 min)** — Roo may timeout, use async job system
- **Bulk data processing (>1GB)** — memory limits, use stream processing outside Roo
- **Sensitive operations** — if you do not trust the code, do not enable Custom Tools

## Alternatives

| Need | Alternative |
|------|-------------|
| External API integration | MCP servers (approved, sandboxed) |
| File operations | Built-in tools (`read_file`, `write_file`) |
| System commands | `execute_command` (with approval prompts) |
| Complex workflows | Skills (SKILL.md) for instructions, not code |
| Team-wide tools | Shared scripts in repo, called via `execute_command`---

**Next:** See [14-checklists.md](13-checklists.md) for production checklists.
