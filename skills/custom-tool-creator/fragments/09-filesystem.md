# 9. FILE SYSTEM

## Access Model

Tools can read/write within allowed paths defined by permissions.

## Reading Files

```javascript
const content = await context.fs.readFile('/path/to/file.txt', 'utf8');
```

## Writing Files

```javascript
await context.fs.writeFile('/path/to/output.json', JSON.stringify(data));
```

## Directory Operations

```javascript
const files = await context.fs.readdir('/some/dir');
const stat = await context.fs.stat('/path/to/file');
```

## Path Restrictions

- Cannot access files outside allowed paths
- Relative paths are relative to workspace root
- Use absolute paths for clarity

## Binary Files

Uses Buffers — handle carefully:

```javascript
const buffer = await context.fs.readFile('/image.png');
// Convert to base64 if needed
const base64 = buffer.toString('base64');
```

## Best Practices

1. Validate paths before operations
2. Use try/catch for file errors
3. Close resources (though fs handles cleanup)
4. Prefer JSON for structured data

→ Next: [Logging](./10-logging.md) | [Testing](./11-testing.md)