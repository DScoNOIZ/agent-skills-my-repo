# ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** This entire document was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy. Content may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

**Русский:** Этот документ полностью создан ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность. Контент может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

---

# Agent Skills Format Specification

## Overview

This document defines the file format for Roo Code agent skills. Skills are self-contained directories with specific files that Roo loads and executes.

## Directory Structure

```
.roo/skills/<skill-id>/           # Required: skill root
├── SKILL.md                      # Required: metadata
├── tool.js | tool.ts | tool.py   # Required: implementation
├── package.json                 # Optional: dependencies
├── references/                  # Optional: documentation
│   ├── *.md
├── assets/                     # Optional: icons, templates
│   ├── icon.png
│   ├── templates/
│   └── examples/
├── scripts/                    # Optional: helper scripts
└── fragments/                  # Optional: documentation fragments
```

## SKILL.md Format

YAML frontmatter with metadata:

```yaml
---
name: "My Skill"
id: "my-skill"
version: "1.0.0"
description: "Description for Roo"
icon: "📦"
author: "Your Name"
tags: ["utility", "api"]
permissions:
  - Network
  - FileSystemRead
implementation:
  file: "tool.js"
  method: "default"
  language: "javascript"
parameters:
  schema:
    type: object
    properties:
      # ...
---
```

## Implementation Files

### JavaScript

```javascript
module.exports = async function({ parameters, context }) {
  // Tool logic
  return { result: 'success' };
};
```

### TypeScript

```typescript
export default async function({
  parameters,
  context
}: {
  parameters: Record<string, any>;
  context: ToolContext;
}) {
  // Tool logic
  return { result: 'success' };
}
```

### Python

```python
def run(parameters, context):
  # Tool logic
  return {'result': 'success'}
```

## Context Object

Provides runtime services:

| Property | Type | Description |
|----------|------|-------------|
| `context.log` | Logger | Debug/info/warn/error logging |
| `context.http` | HTTP client | `request(options)` method |
| `context.fs` | File system | `readFile`, `writeFile`, etc. |
| `context.shell` | Shell executor | `exec(command)` method |
| `context.vault` | Secret store | `get(key)` method |
| `context.workspace` | Workspace helper | Path resolution, config |

## Parameter Schema

Standard JSON Schema Draft 7. Roo validates input before calling your tool.


```yaml
parameters:
  schema:
    type: object
    required: ["requiredParam"]
    properties:
      requiredParam:
        type: string
        description: "Required parameter"
      optionalParam:
        type: number
        default: 100
```

## Permissions

Declare required permissions in SKILL.md:

```yaml
permissions:
  - Network                    # Outbound HTTP/HTTPS
  - FileSystemRead            # Read files (optionally with glob pattern)
  - FileSystemWrite           # Write files
  - Shell                     # Execute commands
  - VaultRead                 # Read secrets
  - VaultWrite                # Write secrets (rare)
```

## Icon

Place `icon.png` in skill root (recommended 128x128px PNG with transparency).

## Loading Order

Roo loads skills from `.roo/skills/` sorted by directory name. Core skills load before user skills.

## Disabling Skills

Rename skill directory with leading underscore: `_my-skill/`.

## Version Compatibility

`rooCodeVersion` field specifies minimum Roo version:

```yaml
rooCodeVersion: "1.5.0"
```

## Multiple Tools in One Skill

Define a `tools` array in SKILL.md:

```yaml
tools:
  - name: "tool1"
    file: "tools/tool1.js"
  - name: "tool2"
    file: "tools/tool2.js"
```

Each tool file exports a function as usual. The skill selector shows individual tools.

## Security Considerations

- Never hardcode secrets
- Validate all inputs
- Use least privilege permissions
- Handle errors gracefully
- Log security-relevant events
- Keep dependencies updated

See [SECURITY.md](SECURITY.md) for detailed threat model.

## Validation

Use `roo validate-skill <path>` command to check skill structure.

---

Spec version: 1.0
Last updated: 2025-10-15
