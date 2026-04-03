# 13. PACKAGING

## Distribute as GitHub Repo

Simplest: share the skill directory as a git repository. Users clone into `.roo/skills/`.

## npm Package (Advanced)

1. Publish to npm with `roo-skill` keyword
2. Users install: `npm install -g my-skill`
3. Roo auto-discovers global skills

## Versioning

Follow semver in `SKILL.md`:

```yaml
version: 1.2.3
```

## README.md

Include usage examples, parameters, and permissions.

## Icon

Add `icon.png` (128x128px PNG) in skill root for visual identification.

## Multiple Entry Points

For multiple tools in one skill, use `tools` array in `SKILL.md`:

```yaml
tools:
  - name: tool1
    file: tools/tool1.js
  - name: tool2
    file: tools/tool2.js
```

## Dependencies

- Test against latest Roo version
- Minimize heavy dependencies
- Pin critical security fixes

→ Next: [Publishing](./14-publishing.md) | [Resources](./15-resources.md)