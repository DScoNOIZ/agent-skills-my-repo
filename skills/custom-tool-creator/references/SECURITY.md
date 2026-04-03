# ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** This entire document was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy. Content may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

**Русский:** Этот документ полностью создан ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность. Контент может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

---

# Security Guidelines for Custom Tools

## Threat Model

Custom tools run with the permissions granted by the user. They can:

- Access the file system (within allowed paths)
- Make network requests (with Network permission)
- Access secrets from vault (with VaultRead permission)
- Execute shell commands (with Shell permission)

## Secure Development Practices

### 1. Secret Management

**NEVER** hardcode API keys, tokens, or passwords. Always use vault:

```javascript
// ✅ Correct
const token = context.vault.get('API_TOKEN');

// ❌ Wrong
const token = 'sk-1234567890abcdef';
```

### 2. Input Validation

Validate all parameters, even if they have JSON schema validation:

```javascript
const { url } = parameters;
if (!url.startsWith('https://')) {
  throw new Error('Only HTTPS URLs allowed');
}
```

### 3. Command Injection Prevention

When executing shell commands, avoid interpolation:

```javascript
// ❌ Dangerous
await context.shell.exec(`rm -rf ${userInput}`);

// ✅ Safe
await context.shell.exec('rm', ['-rf', userInput]);
```

### 4. Path Traversal Protection

```javascript
const basePath = '/allowed/dir';
const userPath = path.normalize(parameters.path);
if (!userPath.startsWith(basePath)) {
  throw new Error('Path outside allowed directory');
}
```

### 5. Least Privilege

Request only the permissions you need. Avoid `Network` if not making HTTP requests. Avoid `Shell` unless absolutely necessary.

### 6. Dependency Security

- Pin dependency versions in `package.json`
- Regular `npm audit` checks
- Update for security patches
- Review third-party code before using

### 7. Error Handling

Don't leak sensitive info in error messages:

```javascript
// ❌ Leaks DB connection string
catch (error) { throw new Error(`DB error: ${error}`); }

// ✅ Generic message
catch { throw new Error('Database operation failed'); }
```

### 8. Output Sanitization

When displaying data in chat, escape or truncate sensitive fields:

```javascript
const safeData = { ...result };
if (safeData.token) safeData.token = '***';
return safeData;
```

## User Security Advice

- Review tool permissions before installing
- Store secrets in vault, not in skill config
- Monitor tool execution logs
- Update skills regularly
- Report vulnerabilities to skill authors

## Reporting Vulnerabilities

If you find a security issue in a skill:

1. Do not open a public issue
2. Contact the skill author privately
3. Provide detailed reproduction steps
4. Allow reasonable time for fix (90 days)

For vulnerabilities in the Roo platform itself, report via GitHub Security Advisories.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JSON Schema Validation](https://json-schema.org/)
