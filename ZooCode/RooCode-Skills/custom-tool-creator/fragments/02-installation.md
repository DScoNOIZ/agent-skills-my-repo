# 2. INSTALLATION

## Prerequisites

- Node.js 18+
- Roo Code extension
- Basic JavaScript/TypeScript knowledge

## Setup Steps

1. **Create skill directory**
   ```bash
   mkdir -p .roo/skills/my-skill
   ```

2. **Add `SKILL.md`**
   Define skill metadata (name, description, icon)

3. **Create tool script**
   `tool.js` or `tool.ts` with main logic

4. **Add `package.json`** (optional)
   For npm dependencies

5. **Reload Roo**
   The skill appears in the skill selector

## Directory Structure

```
.roo/skills/my-skill/
├── SKILL.md              # Required: skill metadata
├── tool.js | tool.ts     # Required: main script
├── package.json         # Optional: dependencies
├── references/          # Optional: documentation
└── assets/             # Optional: icons, templates
```

## Development Workflow

1. Edit files
2. Reload Roo (Ctrl+Shift+P → "Roo: Reload Skills")
3. Test in chat
4. Check logs (`Ctrl+Shift+P` → "Roo: Open Logs")

→ Next: [Format Spec](../references/FORMAT_SPEC.md) | [Tool Script](./03-tool-script.md)