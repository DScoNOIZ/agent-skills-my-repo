# 10-dependencies: Managing npm Packages

## Why Dependencies Matter

Custom Tools can use any npm package. Dependencies provide:
- **Reuse** — avoid reinventing HTTP clients, parsers, utilities
- **Maintenance** — update one package instead of maintaining custom code
- **Security** — npm audit checks known vulnerabilities

But each dependency is a potential attack surface. Aim for minimal, audited packages.

## Installing Dependencies

### Global Tools (`~/.roo/tools`)

```bash
mkdir -p ~/.roo/tools
cd ~/.roo/tools
npm init -y
npm install axios xml2js lodash
```

### Project-Specific Tools (`.roo/tools`)

```bash
mkdir -p .roo/tools
cd .roo/tools
npm init -y
npm install axios
```

### Basic `package.json` Structure

```json
{
  "name": "roo-tools",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "axios": "^1.6.0",
    "xml2js": "^0.6.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "scripts": {
    "test": "jest"
  }
}
```

**Key fields:**
- `"type": "commonjs"` — Roo expects CommonJS modules
- `dependencies` — runtime packages (axios, fs-extra, etc.)
- `devDependencies` — build tools (typescript, jest) used only during development
- `scripts` — npm commands for test/build

**Do NOT include:**
- `"private": true` — unnecessary for local packages
- `"bin"` — not a CLI tool
- `"files"` — entire directory is loaded

## Importing Packages

```javascript
const axios = require('axios');
const xml2js = require('xml2js');
const _ = require('lodash');

module.exports.myTool = {
  name: 'my_tool',
  async execute(params) {
    const response = await axios.get('https://api.example.com');
    return response.data;
  }
};
```

## TypeScript Dependencies

```bash
npm install --save axios
npm install --save-dev typescript @types/node @roo-code/types
```

- `--save` adds to `dependencies`
- `--save-dev` adds to `devDependencies`
- `@roo-code/types` required only for `defineCustomTool`

## Dependency Best Practices

### Minimize Attack Surface

Every dependency adds potential vulnerabilities. Audit before installing.

**Example:** Instead of `lodash` for simple operations:

```javascript
// Instead of _.debounce
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

Use native APIs when possible.

### Use `peerDependencies` Wisely

If your tools should work across different project versions, consider `peerDependencies`:

```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

But for Custom Tools, regular `dependencies` is usually simpler.

### Auditing for Vulnerabilities

```bash
# Check for known vulnerabilities
npm audit

# Auto-fixable issues
npm audit fix

# Update packages to latest safe versions
npm update
```

Add to CI/CD:

```yaml
# .github/workflows/security.yml
- run: npm audit --audit-level moderate
```

### Version Pinning Strategy

- **Caret (^)**: `"axios": "^1.6.0"` — allows minor/patch updates (recommended)
- **Tilde (~)**: `"axios": "~1.6.0"` — allows only patch updates
- **Exact**: `"axios": "1.6.2"` — no automatic updates (use for reproducible builds)

**Recommendation:** Use caret (^) for balance of security and stability.

## Monorepo Considerations

For many tools, use npm workspaces:

```
tools/
├── package.json            # workspace root
├── packages/
│   ├── api-client/
│   │   ├── package.json
│   │   └── src/
│   ├── file-ops/
│   │   ├── package.json
│   │   └── src/
│   └── shared/
│       ├── package.json
│       └── src/
└── node_modules/
```

**Workspace root `package.json`:**

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

Install once at root:

```bash
cd tools
npm install  # installs for all packages
```

Then `.roo/tools/` can symlink to `tools/packages/api-client/dist/`.

## Dependencies Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'xyz'` | Not installed | `npm install xyz` |
| `Unexpected token 'export'` | Package is ESM | Use `import()` or find CJS version |
| `Version conflict` | Two tools need incompatible versions | Use compatible version or separate directories |

### Handling ESM Packages

If a package only provides ESM:

```javascript
// Instead of require()
import('axios').then(axios => {
  // use axios
});
```

Or find a CommonJS-compatible alternative.

### Separate Directories for Version Isolation

If tools require incompatible dependency versions:

```bash
# Option: Separate directories with their own node_modules
~/.roo/tools/group1/  (with its own package.json + node_modules)
~/.roo/tools/group2/  (different versions)
```

## Bundling for Production

Reduce overhead by bundling dependencies into a single file:

```bash
npm install --save-dev esbuild
```

**build.js:**

```javascript
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node18',
  external: ['@roo-code/types']  // keep external if using defineCustomTool
}).catch(() => process.exit(1));
```

After bundling:
- You can delete `node_modules` from `.roo/tools/`
- Keep only `dist/bundle.js` and `package.json` (without dependencies)
- Smaller size, faster loading

**Disadvantages:**
- Harder to debug (source maps help)
- Larger initial bundle if not tree-shaken

## Checklist: Dependencies

- [ ] `package.json` exists with `"type": "commonjs"`
- [ ] `npm install` completed successfully
- `node_modules/` contains all dependencies
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Minimal dependencies — only necessary packages
- [ ] No unused dependencies (run `npm prune`)
- [ ] Production uses only `dependencies` (no `devDependencies`)
- [ ] Version conflicts resolved (compatible versions or separate dirs)

---

**Next:** For environment variables, read [09-environment-variables.md](fragments/09-environment-variables.md). For TypeScript setup, see [11-typescript.md](fragments/11-typescript.md).
