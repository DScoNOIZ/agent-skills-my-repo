---
name: "My Skill"
id: "my-skill"
version: "1.0.0"
description: "Brief description for Roo"
longDescription: |
  More detailed description explaining what the skill does,
  when to use it, and any important notes. Supports Markdown.
icon: "🔧"
author: "Your Name"
tags:
  - utility
  - api
  - data
permissions:
  - Network
  - VaultRead
implementation:
  file: "tool.js"
  method: "default"
  language: "javascript"
parameters:
  schema:
    type: object
    properties:
      input:
        type: string
        description: "Input parameter"
      options:
        type: object
        description: "Optional configuration"
        properties:
          format:
            type: string
            enum: [json, yaml, text]
            default: json
    required: [input]
rooCodeVersion: "1.5.0"
---

# Skill Implementation

Write your tool logic in the specified `tool.js` file.

## Example Implementation

```javascript
module.exports = async function({ parameters, context }) {
  const { input, options } = parameters;

  // Access secrets from vault
  const apiKey = context.vault.get('API_KEY');

  // Make HTTP request
  const response = await context.http.request({
    method: 'POST',
    url: 'https://api.example.com/endpoint',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ input })
  });

  return { result: response.body };
};
```

## Required Secrets

This skill requires the following vault keys:
- `API_KEY` - Your API authentication key

## Permissions Explained

- `Network` - Needed for HTTP requests to external API
- `VaultRead` - Needed to read API_KEY from vault

## Examples

```json
{
  "input": "test data",
  "options": { "format": "json" }
}
```

## Troubleshooting

### API_KEY not found

Set the API_KEY in Roo settings → Vault.

### Network error

Check your internet connection and firewall settings.

---

*This skill template follows the format specification at [FORMAT_SPEC.md](../references/FORMAT_SPEC.md)*