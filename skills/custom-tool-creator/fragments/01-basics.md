# 1. BASICS

## What are Custom Tools?

Custom Tools are scripts that extend Roo's capabilities. They can be:

- **API integrations** (HTTP requests to external services)
- **File operations** (read, write, transform files)
- **System commands** (shell execution with controlled permissions)
- **Data transformations** (process and format data)

## Core Concepts

- **`SKILL.md`**: Metadata file that defines the skill
- **`tool.js` or `tool.ts`**: Main script that implements the tool
- **`package.json`**: Dependencies and configuration
- **JSON Schema**: Input validation for tool parameters

## Minimal Example

```javascript
// tool.js
module.exports = async function({ parameters, context }) {
  console.log('Tool executed!', parameters);
  return { result: 'Success' };
};
```

## Security Model

- Tools run in isolated Node.js environment
- No network access by default (opt-in via permissions)
- File system access restricted to designated paths
- All secrets stored in vault, never in code

→ Next: [Installation](./02-installation.md) | [Format Spec](../references/FORMAT_SPEC.md)