# 14-resources: Official resources and links

## Official documentation

| Resource | URL | Description |
|---------|-----|------------|
| **Custom Tools Docs** | https://docs.roocode.com/features/experimental/custom-tools | Main documentation on Custom Tools from Roo Code |
| **Roo Code GitHub** | https://github.com/RooCodeInc/Roo-Code | Official repository, issues, examples |
| **@roo-code/types** | https://www.npmjs.com/package/@roo-code-types | npm package with `defineCustomTool` and Zod schema |
| **Zod Documentation** | https://zod.dev/ | Validation schemas for TypeScript |
| **Roo Code Marketplace** | https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline | Extension installation |

## Examples from ecosystem

### **Official examples (GitHub)**

```
https://github.com/RooCodeInc/Roo-Code/tree/main/packages/core/src/custom-tools
```

Package `packages/core/src/custom-tools` contains built-in Roo Code tools (read_file, execute_command, etc.). Good source for learning patterns.

### **Community tools**

- **tolgee-admin.js** — 8 tools for translation management (in Columba project)
- **mcp-builder** — skill for creating MCP servers (see `~/.roo/skills/mcp-builder/`)
- **Custom-Modes-Roo-Code** — collection of custom modes (not tools, but useful): https://github.com/jtgsystems/Custom-Modes-Roo-Code

## Custom Tools vs MCP comparison

| Feature | Custom Tools | MCP Servers |
|---------|--------------|-------------|
| **Purpose** | Project-specific logic | External service integration |
| **Language** | JS/TS | Any (via MCP SDK) |
| **Transport** | Built-in (Roo) | stdio/HTTP/SSE |
| **Security** | Auto-approve, no sandbox | Approval prompts, sandboxed |
| **Complexity** | Low (single file) | Medium (separate server) |
| **Use cases** | File ops, git, API wrappers | Search, databases, cloud services |
| **Distribution** | In repository | Separate process/server |

**When to choose:**
- **Custom Tools** — for logic inside repository, file system access, simple API calls
- **MCP** — for external services (Google Search, Jira, Notion), when isolation needed

## TypeScript and Zod resources

| Resource | URL | Description |
|---------|-----|------------|
| **TypeScript Handbook** | https://www.typescriptlang.org/docs/handbook/ | Official guide |
| **Zod Docs** | https://zod.dev/ | Validation schemas, type inference |
| **TypeScript Playground** | https://www.typescriptlang.org/play/ | Quick experiments |
| **ESBuild** | https://esbuild.github.io/ | Bundling for production |

## Security

| Resource | URL | Description |
|---------|-----|------------|
| **OWASP Top 10** | https://owasp.org/www-project-top-ten/ | Critical web application vulnerabilities |
| **Node.js Security** | https://nodejs.org/en/docs/guides/security/ | Node.js security recommendations |
| **SSRF Prevention** | https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html | Protection against SSRF |
| **Command Injection** | https://cheatsheetseries.owasp.org/cheatsheets/Command_Injection_Prevention_Cheat_Sheet.html | Protection against injections |

## Testing

| Resource | URL | Description |
|---------|-----|------------|
| **Jest** | https://jestjs.io/ | Testing framework (recommended) |
| **Nock** | https://github.com/nock/nock | HTTP mocking for Jest |
| **Sinon** | https://sinonjs.org/ | Stubs, spies, mocks |

## Debugging and profiling

| Resource | URL | Description |
|---------|-----|------------|
| **Node.js Debugger** | https://nodejs.org/en/docs/guides/debugging-getting-started/ | --inspect, Chrome DevTools |
| **VS Code Debug** | https://code.visualstudio.com/docs/nodejs/nodejs-debugging | Attach to Node process |
| **Clinic.js** | https://clinicjs.org/ | Performance profiling |

## Useful utilities

### **validate_tools.js**

Location: `~/.roo/skills/custom-tool-creator/scripts/validate_tools.js`

```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/**/*.js
```

Checks:
- Correct export
- Required fields
- JSON Schema validity
- async execute
- Forbidden patterns

### **test_tools_interactively.js**

```bash
node ~/.roo/skills/custom-tool-creator/scripts/test_tools_interactively.js ~/.roo/tools/my-tool.js
```

Interactive test runner.

## Templates (assets/)

All templates are located in `~/.roo/skills/custom-tool-creator/assets/`:

- `template-commonjs.js` — basic template for JavaScript
- `template-typescript.ts` — template with defineCustomTool
- `package.json.template` — starter package.json
- `.env.example` — example environment variables

Use as starting point for new tools.

## Discussion and support

| Platform | URL |
|----------|-----|
| **Roo Code Discord** | https://discord.gg/roocode |
| **Roo Code Reddit** | https://www.reddit.com/r/RooCode/ |
| **GitHub Issues** | https://github.com/RooCodeInc/Roo-Code/issues |
| **Roo Code Docs** | https://docs.roocode.com/ |

## Pre-creation checklist

Before creating a new tool:

- [ ] Read [01-basics.md](01-basics.md) — understand basics
- [ ] Chosen format: CommonJS or TypeScript
- [ ] Defined parameters (JSON Schema or Zod)
- [ ] Implemented execute with async, try/catch, timeout
- [ ] Checked security checklist ([05-security.md](05-security.md))
- [ ] Written unit tests ([06-testing.md](06-testing.md))
- [ ] Added .env if secrets needed ([09-environment-variables.md](09-environment-variables.md))
- [ ] Tested locally through `test_tools_interactively.js`
- [ ] Refresh Custom Tools and manual test in Roo chat

## Further learning

### **For advanced Custom Tools study:**

1. Study built-in Roo Code tools in their source code (GitHub link above)
2. Create simple tool (hello world) → test it
3. Add parameters → validation
4. Integrate external API (with URL validation)
5. Add .env and dependencies
6. Configure TypeScript if needed
7. Write unit tests
8. Use in real project

### **For security:**

1. Read OWASP Top 10
2. Study SSRF Prevention Cheat Sheet
3. Practice white-listing vs black-listing
4. Audit dependencies regularly (`npm audit`)

### **For TypeScript:**

1. TypeScript Handbook (basics)
2. Zod documentation (if using defineCustomTool)
3. Practice type inference and utility types
4. Configure tsconfig for production

## Changes and versioning

This skill (custom-tool-creator) is maintained in the Columba repository.

**Updates:**
- Check `git pull` in `~/.roo/skills/custom-tool-creator/` (if installed via Git)
- Or reinstall by copying current version

**Contributing:**
If you found a bug or want to improve the skill, create a PR in the Columba project.

## License

See LICENSE file in the root of the Columba project.

---

**This is the last fragment. Return to [SKILL.md](../SKILL.md) for navigation through all sections.**