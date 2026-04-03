# 13-checklists: Checklists for production-ready tools

Before using in production, verify tools against these checklists.

## Security checklist

### **Critical checks (perform for each tool)**

- [ ] **No hardcoded secrets** — API keys, passwords, tokens only via `process.env.*`
- [ ] **URL validation** — whitelist hosts or block private IP ranges (SSRF protection)
- [ ] **Path sanitization** — `path.resolve()`, check `..`, workspace restriction
- [ ] **Command injection prevention** — never `exec` with user input; use `spawn` or whitelist
- [ ] **Input size limits** — `maxLength` (strings), `maxItems` (arrays) in schema
- [ ] **Timeout configured** — all external calls ≤30s (fetch, exec, db)
- [ ] **Error messages** — do not reveal internal details (stack traces only in dev)
- [ ] **Logs sanitized** — do not log API keys, passwords, PII
- [ ] **Dependencies audit** — `npm audit` clean, updated regularly
- [ ] **.env in .gitignore** — secrets never committed

### **Additional checks (optional, for critical tools)**

- [ ] **Rate limiting** — if tool makes external requests (10 req/min default)
- [ ] **Resource quotas** — max file size, max memory usage, max execution time
- [ ] **Content Security Policy** — if rendering HTML/SVG, sanitize
- [ ] **XML/JSON injection** — structure validation, do not trust external data
- [ ] **Code review** — at least 2 people reviewed before merge
- [ ] **Static analysis** — `eslint` with `security` plugin, `npm audit` in CI

## Code quality checklist

- [ ] **Async execute** — `execute` declared as `async function`
- [ ] **Try/catch** — all external calls wrapped in try/catch
- [ ] **Return string** — return string or serializable object
- [ ] **No throw** — errors returned as strings, not thrown
- [ ] **Parameter validation** — schema presence, required fields, types
- [ ] **Defense in depth** — additional validation inside execute
- [ ] **Logging** — `console.log` for debug, `console.error` for errors
- [ ] **Resource cleanup** — files, connections closed in `finally`
- [ ] **Memory management** — no leaks, large data is streamed
- [ ] **Idempotency** — repeated calls are safe (where appropriate)

## Testing checklist

### **Unit tests**

- [ ] **Happy path** — valid parameters return expected result
- [ ] **Missing required** — missing required parameters give clear error
- [ ] **Invalid types** — incorrect types are rejected
- [ ] **Edge cases** — boundary values (empty strings, 0, null, huge numbers)
- [ ] **Error handling** — simulate network failures, timeouts, API errors
- [ ] **Security scenarios** — SSRF, path traversal, command injection attempts

### **Integration tests**

- [ ] **Real API calls** — if tool uses external API (with test credentials)
- [ ] **File system** — create/read/delete files (temp dirs)
- [ ] **Database** — if present, with test database
- [ ] **Cleanup** — tests do not leave artifacts

### **Performance tests**

- [ ] **Benchmarks** — execution time within acceptable range (e.g., <1s for simple operations)
- [ ] **Memory usage** — does not grow with number of calls (no leaks)
- [ ] **Concurrency** — parallel calls do not conflict (if expected)

### **Coverage**

- [ ] **Line coverage >80%** for critical tools
- [ ] **Branch coverage** — all if/else branches covered
- [ ] **Security tests** — separate suite for vulnerabilities

## Deployment checklist

### **Before activation**

- [ ] **File placed correctly** — `.roo/tools/` or `~/.roo/tools/`
- [ ] **Syntax valid** — `node --check tool.js` passes
- [ ] **Dependencies installed** — `npm install` completed
- [ ] **Custom Tools enabled** — Settings → Experimental → Enable custom tools = true
- [ ] **Refresh completed** — Ctrl+Shift+P → Refresh Custom Tools
- [ ] **Tool appears in list** — "MCP: List Tools" shows the tool
- [ ] **Manual test passes** — call from Roo chat returns expected result

### **Environment configuration**

- [ ] **.env file created** (if secrets needed)
- [ ] **.env in .gitignore** — never committed
- [ ] **API keys set** — `echo $API_KEY` shows the value
- [ ] **Workspace path correct** — `process.cwd()` points to expected directory

### **Documentation**

- [ ] **README.md** — description, parameters, usage examples
- [ ] **Inline comments** — complex parts are commented
- [ ] **Team notified** — team knows about new tool
- [ ] **Setup instructions** — how to install dependencies, configure env

## Monitoring checklist

### **Logging**

- [ ] **Console logs** — key steps are logged (`console.log`)
- [ ] **Error logs** — errors written to `console.error`
- [ ] **No secrets in logs** — API keys, passwords masked or excluded
- [ ] **Structured logging (optional)** — JSON format for machine parsing

### **Metrics (optional)**

- [ ] **Execution time** — measured and logged for long operations
- [ ] **Success/failure count** — can be tracked via logs
- [ ] **Error rates** — alert if >5% errors

### **Alerting (for critical tools)**

- [ ] **Error threshold** — >10 errors per hour → notification
- [ ] **Performance degradation** — median time increased by 2x → alert
- [ ] **Usage spikes** — unexpected surge in calls → check

## Team workflow checklist

### **Code review**

- [ ] **PR template** — includes security review items
- [ ] **At least 2 reviewers** — for all changes in `.roo/tools/`
- [ ] **Security focused review** — special attention to input validation, external calls
- [ ] **Testing requirement** — new tools must have unit tests

### **Version control**

- [ ] **Git tracked** — `.roo/tools/` added to Git (except `.env`)
- [ ] **Commit messages** — clear, reference to issue/task
- [ ] **Branch strategy** — feature branches, PRs, no direct main commits
- [ ] **Tag releases** — if tools share versioning with project

### **Onboarding**

- [ ] **Setup guide** — README with instructions for new team members
- [ ] **Dependencies auto-install** — `npm install` script in `.roo/tools/`
- [ ] **Environment template** — `.env.example` provided
- [ ] **Demo session** — new hires shown how to use tools

## Maintenance checklist

### **Regular tasks (monthly)**

- [ ] **Dependency updates** — `npm outdated`, `npm update`
- [ ] **Security audit** — `npm audit`, fix vulnerabilities
- [ ] **Review logs** — look for anomalies, frequent errors
- [ ] **Performance review** — measure execution times, optimize if needed
- [ ] **Documentation update** — update README when API changes

### **Quarterly**

- [ ] **Security review** — recheck SSRF, path traversal, command injection protections
- [ ] **Access audit** — who has access to `.roo/tools/`, everything needed
- [ ] **Usage analysis** — which tools are used, which are not (cleanup)
- [ ] **Tech debt** — refactoring, improving types (TypeScript migration)

### **Yearly (or on major release)**

- [ ] **Architecture review** — still fits needs?
- [ ] **Alternative evaluation** — maybe MCP or external scripts are better?
- [ ] **Training** — update team on best practices (new members, new Roo features)
- [ ] **Compliance** — if regulatory (GDPR, HIPAA), check compliance

## Incident response checklist

If tool is compromised or behaving incorrectly:

### **Immediate actions**

- [ ] **Disable tool** — delete or rename tool file
- [ ] **Rotate secrets** — if API key potentially leaked, generate new one
- [ ] **Review logs** — find all calls from last 24-72 hours
- [ ] **Assess impact** — what data/systems could have been affected
- [ ] **Notify** — team, security team (if exists)

### **Investigation**

- [ ] **Root cause** — how vulnerability arose (missing validation, dependency compromise)
- [ ] **Code changes** — check Git history, who changed what
- [ ] **External factors** — compromised npm package? social engineering?
- [ ] **Similar tools** — check other tools for same vulnerability

### **Recovery**

- [ ] **Patch vulnerability** — fix code (add validation, update dependency)
- [ ] **Test fix** — unit + integration tests for exploit
- [ ] **Redeploy** — Refresh Custom Tools, check operation
- [ ] **Post-mortem** — document incident, lessons learned
- [ ] **Prevent recurrence** — add automated test, security scan

## Production readiness scorecard

Rate each tool on scale 1-5 (1=poor, 5=excellent):

| Category | Weight | Score | Weighted |
|-----------|-----|-------|----------|
| **Security** (40%) | 0.4 | ___ | ___ |
| - Secrets management | | 1-5 | |
| - Input validation | | 1-5 | |
| - SSRF protection | | 1-5 | |
| - Path traversal protection | | 1-5 | |
| **Code Quality** (25%) | 0.25 | ___ | ___ |
| - Error handling | | 1-5 | |
| - Timeouts | | 1-5 | |
| - Logging | | 1-5 | |
| - Resource cleanup | | 1-5 | |
| **Testing** (20%) | 0.25 | ___ | ___ |
| - Unit tests coverage | | 1-5 | |
| - Integration tests | | 1-5 | |
| - Security tests | | 1-5 | |
| **Documentation** (10%) | 0.1 | ___ | ___ |
| - README clarity | | 1-5 | |
| - Parameter examples | | 1-5 | |
| - Setup guide | | 1-5 | |
| **Performance** (5%) | 0.05 | ___ | ___ |
| - Execution time | | 1-5 | |
| - Memory usage | | 1-5 | |
| **Total** | **1.0** | | **Sum** |

**Rating:**
- **4.0+** — production-ready
- **3.0-3.9** — can be used with caution, needs improvements
- **<3.0** — not ready, requires significant work

## Quick pre-deploy checklist (5 minutes)

Before each deployment of new tool or change:

```
□ File in correct directory
□ Syntax check: node --check tool.js
□ Required fields: name, description, parameters, execute
□ Async execute + try/catch
□ Timeout on external calls
□ No hardcoded secrets
□ Workspace restriction (if file operations)
□ URL whitelist (if HTTP)
□ Command whitelist (if exec)
□ Test run: node test_tools_interactively.js tool.js
□ Refresh Custom Tools
□ Manual test in Roo chat
```

If any item fails → fix before deployment.

---

**Next:** Official resources and links see in [15-resources.md](14-resources.md).