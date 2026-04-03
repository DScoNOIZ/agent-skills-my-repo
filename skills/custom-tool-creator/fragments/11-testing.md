# 11. TESTING

## Unit Tests

Create `test/` directory with Jest tests:

```
skill/
├── tool.js
├── SKILL.md
└── test/
    └── tool.test.js
```

## Example Test

```javascript
const { runTool } = require('./tool');

describe('MyTool', () => {
  it('should process input correctly', async () => {
    const result = await runTool({
      parameters: { input: 'test' },
      context: { log: console.log }
    });
    expect(result).toHaveProperty('success', true);
  });
});
```

## Manual Testing

1. Open Roo chat
2. Select your skill
3. Provide test parameters
4. Check output in chat
5. Review logs for details

## Debugging

- Use `console.log` (works normally)
- Check Roo logs for errors
- Enable debug logging in settings
- Use `context.log.debug()` for verbose output

## Integration Testing

Test with realistic vault values and file paths.

→ Next: [Examples](./12-examples.md) | [Packaging](./13-packaging.md)