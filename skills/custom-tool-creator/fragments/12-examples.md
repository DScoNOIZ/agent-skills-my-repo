# 12. EXAMPLES

## Simple Calculator

```javascript
module.exports = async function({ parameters }) {
  const { a, b, operation } = parameters;
  let result;
  switch (operation) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = a / b; break;
    default: throw new Error('Unknown operation');
  }
  return { result };
};
```

## API Caller with Vault

```javascript
module.exports = async function({ parameters, context }) {
  const { endpoint } = parameters;
  const apiKey = context.vault.get('API_KEY');
  const response = await context.http.request({
    method: 'GET',
    url: endpoint,
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return { data: response.body };
};
```

## File Processor

```javascript
module.exports = async function({ parameters, context }) {
  const { inputPath, outputPath } = parameters;
  const content = await context.fs.readFile(inputPath, 'utf8');
  const processed = content.toUpperCase();
  await context.fs.writeFile(outputPath, processed);
  return { success: true, bytes: processed.length };
};
```

## Shell Executor

```javascript
module.exports = async function({ parameters, context }) {
  const { command } = parameters;
  const result = await context.shell.exec(command);
  return { stdout: result.stdout, stderr: result.stderr, code: result.code };
};
```

→ Next: [Packaging](./13-packaging.md) | [Publishing](./14-publishing.md)