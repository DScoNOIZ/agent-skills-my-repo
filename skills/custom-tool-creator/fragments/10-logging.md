# 10. LOGGING

## Logger Access

Use `context.log` for debug and info output:

```javascript
context.log('Processing item', item.id);
context.log.debug('Detailed debug info');
context.log.info('Status update');
context.log.warn('Potential issue');
context.log.error('Error occurred', error);
```

## Log Levels

- `debug` - Detailed diagnostic info
- `info` - General progress
- `warn` - Warnings (not errors)
- `error` - Errors and exceptions

## Visibility

Logs appear in:
- Roo log panel
- Execution history
- Debug console (when debugging)

## Structured Logging

Pass multiple arguments for structured output:

```javascript
context.log('API call', { url, method, status });
// Output: API call { url: '...', method: '...', status: 200 }
```

## Performance

Logging is async — avoid logging huge objects (MB+).

→ Next: [Testing](./11-testing.md) | [Examples](./12-examples.md)