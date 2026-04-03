# Testing Guide for Custom Tools

Comprehensive strategies for testing Custom Tools to ensure reliability and correctness.

## Table of Contents

1. [Testing Pyramid](#testing-pyramid)
2. [Static Validation](#static-validation)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Manual Testing](#manual-testing)
6. [CI/CD Integration](#cicd-integration)

## Testing Pyramid

```
          E2E / Manual Testing (few)
         /
   Integration Tests (some)
  /
Unit Tests (many)
```

Focus on:
- **Unit tests**: 70% — test individual functions in isolation
- **Integration tests**: 20% — test tool with mocked dependencies
- **Manual/E2E**: 10% — test in Roo Code chat interface

## Static Validation

Before writing tests, use the provided validator:

```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/**/*.js
```

This checks:
- Proper export structure
- Required fields (`name`, `description`, `parameters`, `execute`)
- JSON Schema validity
- `execute` is async
- Forbidden patterns (`eval`, hardcoded secrets)

**Exit codes:**
- `0` = all valid
- `1` = errors found

Add as pre-commit hook or CI step.

## Unit Testing

### Framework: Jest

Install Jest:
```bash
cd ~/.roo/tools
npm install --save-dev jest
```

Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**']
};
```

### Example Unit Test

```javascript
// __tests__/api-client.test.js
const tools = require('../api-client.js');

describe('apiClient', () => {
  beforeEach(() => {
    // Setup test fixtures
    process.env.API_KEY = 'test-key-123';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.API_KEY;
  });

  describe('parameter validation', () => {
    test('requires url parameter', async () => {
      const result = await tools.apiClient.execute({});
      expect(result.error).toBeDefined();
      expect(result.error).toContain('url');
    });

    test('accepts valid url', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      const result = await tools.apiClient.execute({ url: 'https://api.example.com' });
      expect(result.data).toBe('test');
    });

    test('validates url protocol (https only)', async () => {
      const result = await tools.apiClient.execute({ url: 'http://api.example.com' });
      expect(result.error).toContain('HTTPS');
    });
  });

  describe('HTTP handling', () => {
    test('handles 401 Unauthorized', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Invalid API key')
      });

      const result = await tools.apiClient.execute({ url: 'https://api.example.com' });
      expect(result.error).toContain('401');
    });

    test('retries on network failure', async () => {
      // First two calls fail, third succeeds
      fetch.mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'retry success' })
        });

      const result = await tools.apiClient.execute({ url: 'https://api.example.com' });
      expect(result.data).toBe('retry success');
    });
  });
});
```

### Mocking External Dependencies

**Mocking `fetch`:**
```javascript
global.fetch = jest.fn();
```

**Mocking `fs`:**
```javascript
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  stat: jest.fn()
}));
const fs = require('fs/promises');
```

**Mocking `child_process.exec`:**
```javascript
const { exec } = require('child_process');
jest.spyOn(require('child_process'), 'exec').mockImplementation((cmd, args, cb) => {
  cb(null, 'command output', '');
});
```

### Coverage Goals

- **Target**: >80% line coverage
- **Minimum**: 60% line coverage
- Pay special attention to:
  - Error paths (catch blocks)
  - Validation logic
  - Edge cases (empty inputs, null, special characters)

Run coverage:
```bash
npx jest --coverage
```

## Integration Testing

Test the tool as a complete module with real dependencies (but still mocked external services).

### With Real Dependencies

For tools that use `axios`, `xml2js`, etc., install them in `~/.roo/tools/node_modules` and test against them.

```bash
cd ~/.roo/tools
npm install axios xml2js
```

```javascript
// __tests__/transform.test.js
const tools = require('../transform.js');

describe('convertData', () => {
  test('converts JSON to CSV', async () => {
    const input = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];
    const result = await tools.convertData.execute({
      data: input,
      fromFormat: 'json',
      toFormat: 'csv'
    });

    expect(result).toContain('name,age');
    expect(result).toContain('Alice,30');
  });
});
```

### With HTTP Test Servers

Instead of mocking fetch, spin up a local test server:

```javascript
const http = require('http');

beforeAll(done => {
  server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    }
  });
  server.listen(3000, done);
});

afterAll(done => {
  server.close(done);
});

test('calls API endpoint', async () => {
  const result = await tools.apiClient.execute({
    url: 'http://localhost:3000/health'
  });
  expect(result.status).toBe('ok');
});
```

## Manual Testing

### Interactive Test Runner

Use the provided `test_tools_interactively.js`:

```bash
node ~/.roo/skills/custom-tool-creator/scripts/test_tools_interactively.js ~/.roo/tools/api-client.js
```

This loads the tool and lets you enter JSON parameters interactively.

### Test in Roo Code

1. Refresh Custom Tools
2. Open chat
3. Type: `Use my_tool with parameters: { "param": "value" }`
4. Observe output
5. Check logs: **View → Output → "Roo Code"**

### Test Checklist

For each tool, manually verify:

- [ ] Tool appears in MCP: List Tools after Refresh
- [ ] Tool can be called from chat
- [ ] Missing required parameters show helpful error
- [ ] Invalid parameter types are rejected
- [ ] Network calls timeout after 30s
- [ ] File paths outside workspace are rejected
- [ ] API keys from `.env` are loaded
- [ ] Error messages are user-friendly
- [ ] Logs appear in Output panel

## Test Data Management

### Fixtures

Store test data in `__tests__/fixtures/`:

```
__tests__/
├── fixtures/
│   ├── api-responses.json
│   ├── sample-files/
│   └── expected-outputs/
└── my-tool.test.js
```

Load fixtures:
```javascript
const responseFixture = require('./fixtures/api-responses.json');
```

### Temporary Files

For file operation tests, use `tmp` directory:

```javascript
const tmpDir = require('os').tmpdir();
const testFile = path.join(tmpDir, `test-${Date.now()}.txt`);
await fs.writeFile(testFile, 'test content');
// Run test
await fs.unlink(testFile); // Cleanup
```

## E2E Testing

### Workflow Tests

Test complete user workflows:

1. Create new tool file
2. Run `validate_tools.js`
3. Refresh Custom Tools in Roo
4. Execute tool via chat
5. Verify output matches expectations

Could be automated with Puppeteer/Playwright if needed, but Roo Code doesn't expose a stable API for this yet.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Custom Tools CI

on:
  push:
    paths:
      - '.roo/tools/**'
  pull_request:
    paths:
      - '.roo/tools/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Validate tools
        run: node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js .roo/tools/**/*.js
      - name: Run tests
        run: npm test
      - name: Security audit
        run: npm audit --audit-level moderate
```

### Pre-commit Hook

Use `husky` to run validation before commits:

```bash
npm install --save-dev husky
npx husky add .husky/pre-commit "node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js .roo/tools/**/*.js"
```

## Debugging Failed Tests

### Common Issues

1. **Mock not working**: Ensure you mock before requiring the module
   ```javascript
   // WRONG: require first, then mock
   const tools = require('../my-tool');
   global.fetch = jest.fn(); // Won't affect already-loaded module

   // RIGHT: mock first, or use jest.mock()
   global.fetch = jest.fn();
   const tools = require('../my-tool');
   ```

2. **Async test not waiting**: Return the promise or use `async/await`
   ```javascript
   test('async test', async () => {
     const result = await tools.myTool.execute(params);
     expect(result).toBe('expected');
   });
   ```

3. **Module cache pollution**: Use `jest.resetModules()` between tests if needed
   ```javascript
   beforeEach(() => {
     jest.resetModules();
   });
   ```

### Verbose Logging

Add `--verbose` flag for detailed output:
```bash
npx jest --verbose
```

Or add `console.log` in tests (they'll appear in test output).

## Performance Testing

For tools that need performance guarantees, add performance tests:

```javascript
test('executes within 5 seconds', async () => {
  const start = Date.now();
  await tools.heavyTool.execute({ bigInput: '...' });
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(5000);
}, 10000); // Increase Jest timeout to 10s
```

## Test Maintenance

- Keep tests up to date with tool changes
- Refactor tests when code is refactored
- Remove obsolete tests
- Review coverage reports regularly

## See Also

- [BEST_PRACTICES.md](BEST_PRACTICES.md) - Code quality guidelines
- [SECURITY.md](SECURITY.md) - Security testing considerations
- [DEBUGGING.md](DEBUGGING.md) - Debugging techniques for failing tests
