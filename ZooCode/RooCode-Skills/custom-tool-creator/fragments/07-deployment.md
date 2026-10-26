# 07-deployment: Deployment and Activation

After creating a tool, you need to activate it in Roo Code and configure it for use.

## Quick Start Checklist

1. **Place file** — in `~/.roo/tools/` (global) or `<workspace>/.roo/tools/` (project)
2. **Install dependencies** — if npm packages are needed
3. **Enable Custom Tools** — in Settings → Experimental
4. **Refresh Custom Tools** — Ctrl+Shift+P
5. **Verify loading** — "MCP: List Tools"
6. **Test** — in Roo chat

## File Preparation

### For JavaScript

```bash
# Create file
mkdir -p ~/.roo/tools
code ~/.roo/tools/my-tool.js
```

Check syntax:

```bash
node --check ~/.roo/tools/my-tool.js
```

### For TypeScript

```bash
cd ~/.roo/tools
npm init -y
npm install @roo-code/types
npm install --save-dev typescript
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

Structure:

```
~/.roo/tools/
├── src/
│   └── my-tool.ts
├── dist/              # generated
├── package.json
└── tsconfig.json
```

Compilation:

```bash
npx tsc
# Roo loads dist/*.js
```

## Installing npm Dependencies

If the tool needs external libraries:

```bash
cd ~/.roo/tools
npm init -y
npm install axios xml2js  # example
```

Import in the tool:

```javascript
const axios = require('axios');
const xml2js = require('xml2js');
```

**Important:** Install in the tools directory itself, not globally.

## Enabling Custom Tools

1. Open Roo Code Settings (gear icon in top right)
2. Find the **Experimental** section
3. Toggle **Enable custom tools** → `true`
4. (Optional) **Custom Tools Require Approval** → `false` (recommended for trusted tools)
5. Restart VS Code window: `Developer: Reload Window`

**Security note:** Custom Tools are **auto-approve** when enabled. Only enable for code you trust.

## Refresh Custom Tools

After any tool file change:

1. Ctrl+Shift+P → "Custom Tools: Refresh"
2. Or via Command Palette: "Refresh Custom Tools"

**Why Refresh:**
- Roo caches loaded tools
- Automatic reload doesn't work reliably
- Refresh re-reads all files from `.roo/tools/` and `~/.roo/tools/`

## Verifying Load

After Refresh, verify the tool loaded:

### Via Command Palette

Ctrl+Shift+P → "MCP: List Tools"

Find your tool in the list. If it's not there — check logs.

### Via Output

View → Output → select "Roo Code" from dropdown

Look for messages:
```
[Custom Tools] Loaded 3 tools from ~/.roo/tools/
[Custom Tools] ✓ my_tool (my-tool.js)
[Custom Tools] ✗ failed to load erroneous-tool.js: Error: ...
```

### Via direct require

```bash
node -e "console.log(Object.keys(require('~/.roo/tools/my-tool.js')))"
# Should output: [ 'myTool' ]
```

## First Test Call

In Roo Code chat:

```
Use my_tool with parameters: { "param1": "test", "param2": 42 }
```

Or more specifically:

```
Execute api_get with parameters: { "url": "https://api.example.com/health" }
```

**Expected result:** The tool executes and returns a string/object.

## Troubleshooting

### Tool doesn't appear in list

**Check:**
1. Custom Tools enabled in Settings
2. File has `.js` or `.ts` extension
3. Syntax is correct: `node --check tool.js`
4. Export is correct: `module.exports.myTool = {...}` (not `module.exports = {myTool: {...}}` if name='myTool')
5. Refresh Custom Tools was executed
6. No errors in Output → "Roo Code"

### "Cannot find module"

Means Roo can't locate the tool:

1. File in correct directory: `~/.roo/tools/` or `.roo/tools/`
2. File name ends with `.js` (not `.ts` if not compiled)
3. All dependencies installed: `npm install` in `~/.roo/tools/`

### "Tool execute is not a function"

Validation error:

```javascript
// BAD
module.exports = {
  myTool: {
    name: 'myTool',
    execute: function() { ... }  // NOT async?
  }
};

// GOOD
module.exports.myTool = {
  name: 'myTool',
  execute: async function() { ... }  // async
};
```

Ensure `execute` is an async function.

### Runtime errors

If tool crashes during execution:

1. Check Roo Code logs: View → Output → "Roo Code"
2. Run the tool directly:

```bash
node -e "require('~/.roo/tools/my-tool.js').myTool.execute({params}).then(console.log).catch(console.error)"
```

3. Add `console.log` at start of execute for debugging
4. Check environment variables: `echo $MY_TOOL_API_KEY`

### Refresh doesn't help

1. Restart VS Code window: `Developer: Reload Window`
2. Ensure Custom Tools are still enabled (sometimes reset)
3. Check file permissions (readable)
4. Delete `node_modules` and reinstall dependencies

### TypeScript not working

Ensure:
1. `tsc` compiled without errors: `npx tsc --noEmit`
2. Roo loads `.js` files from `dist/`, not `.ts`
3. `tsconfig.json` has `"module": "CommonJS"`
4. Refresh done after compilation

## Production Deployment

### For teams (project-specific tools)

1. **Create `.roo/tools/` in project root**
2. **Add to Git** (except `.env`):

```bash
git add .roo/tools/
echo ".env" >> .roo/.gitignore
git add .roo/.gitignore
```

3. **Document** — create `TOOLS.md` in project root:

```markdown
## Custom Tools in the Project

| Tool | Description | Parameters |
|------|-------------|------------|
| `api_client` | HTTP client with retry | `url`, `method`, `body` |
| `batch_rename` | Batch file rename | `directory`, `pattern` |
| `git_commit` | Git commit with validation | `message`, `branch` |

**Setup:** Copy `.env.example` to `.roo/tools/.env` and fill in variables.
```

4. **Instructions for new team members:**
   - Install dependencies: `cd .roo/tools && npm install`
   - Enable Custom Tools in Settings
   - Refresh Custom Tools
   - Verify loading via "MCP: List Tools"

### For personal use (global tools)

```bash
# Install in home directory
mkdir -p ~/.roo/tools
code ~/.roo/tools/my-tool.js

# Install dependencies (if needed)
cd ~/.roo/tools
npm install

# Environment setup
cp .env.example .env
# Edit .env with your keys
```

**Updating:** Tools in `~/.roo/tools/` are available in all projects. Change file → Refresh → changes apply globally.

## Monitoring and Logs

### Where to view logs

Roo Code writes logs to the Output panel:

1. View → Output
2. In dropdown, select "Roo Code"
3. You see:
   - Tools loading
   - Execute logs (from `console.log`)
   - Validation errors
   - Stack traces

### Logs to file

If you need to persist logs:

```javascript
const fs = require('fs/promises');
const path = require('path');

async execute(params) {
  const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(params)}\n`;
  await fs.appendFile(path.join(__dirname, 'tool.log'), logEntry);
  // ... logic
}
```

**Warning:** Log file can grow indefinitely. Use log rotation.

### Structured logging

For complex tools:

```javascript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  tool: 'my_tool',
  params: { ...params },
  context: context?.mode
}));
```

## Performance Tuning

### Measure execution time

```javascript
async execute(params) {
  const start = Date.now();

  // ... logic

  const duration = Date.now() - start;
  console.log(`[MyTool] Took ${duration}ms`);
  return result;
}
```

### Profiling

If tool is slow:

1. Time each stage
2. Find bottleneck (network, disk, CPU)
3. Optimize:
   - Batch operations instead of loops
   - Cache results
   - Parallel requests (Promise.all)
   - Streaming for large files

## Updating Tools

### Minor changes (bug fixes)

1. Edit file
2. Refresh Custom Tools
3. Verify old cache cleared (Output)

### Major changes (breaking API)

1. Create new version of tool with different name:

```javascript
module.exports.myToolV2 = {
  name: 'my_tool_v2',  // new name!
  // ...
};
```

2. Keep old tool for backwards compatibility (if needed)
3. Update documentation
4. Notify users

## Rollback

If update broke something:

1. Restore previous file version from Git
2. Refresh Custom Tools
3. Verify tool works again

**Quick rollback:**

```bash
cd ~/.roo/tools
git checkout HEAD~1 -- my-tool.js  # if in Git
# or restore from backup
Refresh Custom Tools
```

## Security Considerations During Deployment

- **Never commit .env** — add to `.gitignore`
- **Review code** — especially team tools
- **Minimal permissions** — tool should do only what's needed
- **Regular audits** — `npm audit`, update dependencies
- **Monitor usage** — log all calls, watch for anomalies

## Pre-activation Checklist

- [ ] File placed in correct directory (`.roo/tools/` or `~/.roo/tools/`)
- [ ] Syntax valid: `node --check tool.js`
- [ ] Dependencies installed: `npm install` (if needed)
- [ ] Custom Tools enabled in Settings
- [ ] Refresh Custom Tools executed
- [ ] Tool appears in "MCP: List Tools"
- [ ] Test call works (try in chat)
- [ ] Logs appear in Output → "Roo Code"
- [ ] No loading errors
- [ ] Environment variables set (if needed)

---

**Next:** Study [08-examples.md](08-examples.md) for ready-to-use tool templates.
