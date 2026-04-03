---
name: "Custom Tool Creator"
id: "custom-tool-creator"
version: "1.0.0"
description: "Expert in building custom tools for Roo agents in all formats (CommonJS, ES Modules, TypeScript). Provides templates, best practices, and security guidelines."
longDescription: |
  The **Custom Tool Creator** skill is a comprehensive resource for developers building custom tools for Roo Code agents. It includes complete templates, working examples, and detailed documentation covering everything from basic setup to advanced patterns. The skill supports multiple formats (CommonJS, ES Modules, TypeScript) and includes security best practices, testing strategies, and deployment instructions. This is a reference implementation demonstrating the full capabilities of the Roo skills system.

  This skill is **AI-Generated** by Step-3.5-Flash. The repository owner admits complete ignorance of code and cannot verify accuracy or safety. Use at your own risk. All content should be independently verified before use.
icon: "🔧"
author: "AI (Step-3.5-Flash) - DScoNOIZ"
tags:
  - utility
  - development
  - templates
  - examples
permissions:
  - Network
  - VaultRead
  - FileSystemRead
  - FileSystemWrite
implementation:
  file: "tool.js"
  method: "default"
  language: "javascript"
parameters:
  schema:
    type: object
    properties:
      format:
        type: string
        enum: [commonjs, typescript, python]
        default: commonjs
        description: "Template format to generate"
      includeExamples:
        type: boolean
        default: true
        description: "Include example code in output"
      outputPath:
        type: string
        description: "Where to save generated files"
    required: []
rooCodeVersion: "1.5.0"
---

# ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** This entire skill was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy. Code may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

**Русский:** Этот навык полностью создан ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность. Код может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

---

# Custom Tool Creator Skill

This skill provides a complete toolkit for creating custom tools for Roo Code agents. It serves as both a reference implementation and a generator for new tool projects.

## Features

- **Multi-format support**: CommonJS, ES Modules, TypeScript
- **Template generation**: Create new tools from proven patterns
- **Security guidelines**: Best practices for safe tool development
- **20+ examples**: Working examples covering common use cases
- **Validation tool**: Check your skill structure before submission
- **Complete documentation**: 15 topic fragments with detailed explanations

## Quick Start

1. **Select the skill** in Roo Code
2. **Choose format** (commonjs, typescript, or python)
3. **Get template** with optional examples
4. **Customize** for your specific needs
5. **Follow security guidelines** from references/

## Tool Definition

This skill itself demonstrates the complete skill format. Explore the `skills/custom-tool-creator/` directory to see:

- `SKILL.md` - This file (metadata)
- `tool.js` - Implementation (would be actual tool logic)
- `fragments/` - Detailed documentation on each topic
- `references/` - FORMAT_SPEC.md and SECURITY.md
- `assets/` - Templates, examples, and helper files
- `scripts/` - Validation and utility scripts

## Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `commonjs` | Template format: commonjs, typescript, python |
| `includeExamples` | boolean | `true` | Include example code in output |
| `outputPath` | string | (none) | Where to save generated files |

## Output

The tool returns a generated skill structure based on the selected format. It creates the necessary files and directories following the official format specification.

## Permissions

This skill requires:
- `Network` - To download templates or check for updates (optional)
- `VaultRead` - To access configuration secrets (none currently used)
- `FileSystemRead` - To read template files
- `FileSystemWrite` - To create new skill files when outputPath is specified

## Security Notes

⚠️ **IMPORTANT**: This skill generates code that will be executed by Roo Code. Always:

1. Review generated code before using
2. Validate all inputs in your custom tools
3. Store secrets in vault, never in code
4. Request only necessary permissions
5. Keep dependencies updated

See `references/SECURITY.md` for comprehensive security guidelines.

## Examples

### Generate a CommonJS tool

```json
{ "format": "commonjs", "outputPath": "./my-tool" }
```

### Generate TypeScript tool with examples

```json
{ "format": "typescript", "includeExamples": true }
```

### Just show template (no files written)

```json
{ "format": "commonjs", "includeExamples": false }
```

## Learning Path

If you're new to custom tools, follow this sequence:

1. Read `fragments/01-basics.md` - Core concepts
2. Read `fragments/02-installation.md` - Setup instructions
3. Read `fragments/03-tool-script.md` - Implementation details
4. Browse `assets/examples/` - Working examples
5. Review `references/FORMAT_SPEC.md` - Complete format spec
6. Check `references/SECURITY.md` - Security best practices

## Troubleshooting

### Tool not appearing after installation

- Ensure files are in correct location: `.roo/skills/custom-tool-creator/`
- Reload Roo skills (Ctrl+Shift+P → "Roo: Reload Skills")
- Check Roo logs for errors

### Generated code doesn't work

- Verify you have required dependencies in package.json
- Check that permissions in SKILL.md match your needs
- Review logs for specific error messages
- Ensure your Roo version supports the features used

### Permission errors

- Add required permissions to SKILL.md
- Reload the skill after modifying SKILL.md
- Some permissions require user approval on first use

## Contributing

This is a personal collection skill. However, improvements are welcome:

1. Fork the repository
2. Make changes following the format spec
3. Test thoroughly with different configurations
4. Submit a pull request

## License

See repository root for license information.

---

*This skill is part of the [Roo Skills Collection](https://github.com/DScoNOIZ/agent-skills-my-repo).*

*Generated and maintained by AI (Step-3.5-Flash) with human oversight. **Creator admits ignorance of code. User beware.***
