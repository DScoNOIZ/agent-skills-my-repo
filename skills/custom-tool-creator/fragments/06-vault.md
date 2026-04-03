# 6. VAULT ACCESS

## What is the Vault?

The vault securely stores secrets (API keys, tokens, passwords) separate from code.

## Accessing Secrets

```javascript
const apiKey = context.vault.get('OPENAI_API_KEY');
```

## Setting Secrets

Users store secrets via Roo settings or commands. Tools only **read** them.

## Supported Secret Types

- API keys
- OAuth tokens
- Database passwords
- Private keys
- Any sensitive string

## Best Practices

1. **NEVER hardcode secrets** in tool code
2. **Use descriptive names** like `GITHUB_TOKEN` or `DATABASE_URL`
3. **Document required secrets** in `SKILL.md` description
4. **Check for null** to handle missing secrets gracefully

```javascript
const token = context.vault.get('API_TOKEN');
if (!token) {
  throw new Error('API_TOKEN not set in vault');
}
```

→ Next: [Permissions](./07-permissions.md) | [HTTP Requests](./08-http.md)