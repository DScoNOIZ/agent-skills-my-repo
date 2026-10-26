# 06-testing: Testing and Validation of Tools

Testing Custom Tools is critical due to auto-approve and filesystem/network access.

## Test Types

| Type | Goal | Tools |
|------|------|-------|
| **Static validation** | Syntax, exports, schema | `node --check`, `validate_tools.js` |
| **Unit tests** | execute logic, error handling | Jest, mocks for fetch/fs/exec |
| **Integration tests** | Real API/file calls | real API, temp files |
| **Manual testing** | Quick context check | `test_tools_interactively.js` |
| **Security tests** | SSRF, path traversal, injection | custom test cases |

## Static Validation

### Syntax Check

```bash
# JavaScript
node --check ~/.roo/tools/my-tool.js

# TypeScript
npx tsc --noEmit
```

### validate_tools.js

Universal validator (see `scripts/validate_tools.js`):

```bash
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/**/*.js
```

**What it checks:**
- Existence of `module.exports.{toolName}` or `export default`
- Required fields: `name`, `description`, `parameters`, `execute`
- `parameters.type === 'object'`
- `execute` is an async function
- No forbidden patterns: `import` in CJS, `eval()`, hardcoded secrets
- For Zod: schema correctness (if used)

**Example output:**
```
✓ my-tool.js (myTool)
  ✓ name: string
  ✓ description: string (42 chars)
  ✓ parameters: valid JSON Schema
  ✓ execute: async function
✗ validator.js (validateInput)
  ✗ Missing required field: description
```

## Interactive Test Runner

`test_tools_interactively.js` (see `scripts/`):

```bash
node ~/.roo/skills/custom-tool-creator/scripts/test_tools_interactively.js ~/.roo/tools/my-tool.js
```

**How it works:**
1. Loads the tool
2. Shows parameters (JSON Schema)
3. Accepts JSON from stdin
4. Executes `execute`
5. Prints result

**Usage:**

```
$ node test_tools_interactively.js ~/.roo/tools/api-client.js
Tool: api_client
Parameters:
{
  "url": "string (required)",
  "method": "string (optional, default: GET)",
  "body": "object (optional)"
}
Enter params (JSON): {"url": "https://api.example.com/health"}
Result: {"status":"ok"}
```

## Unit Tests with Jest

### Setup

```bash
cd ~/.roo/tools
npm init -y
npm install --save-dev jest
```

### Mocking fetch

```javascript
// __tests__/apiClient.test.js
const tools = require('../api-client.js');

describe('apiClient', () => {
  beforeEach(() => {
    process.env.API_KEY = 'test-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('validates required url', async () => {
    const result = await tools.apiClient.execute({});
    expect(result).toContain('url');
    expect(result).toContain('required');
  });

  test('handles HTTP 401', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized')
    });

    const result = await tools.apiClient.execute({ url: 'https://api.test' });
    expect(result).toContain('401');
    expect(result).toContain('Unauthorized');
  });

  test('returns JSON on success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test', success: true })
    });

    const result = await tools.apiClient.execute({ url: 'https://api.test' });
    const parsed = typeof result === 'object' ? result : JSON.parse(result);
    expect(parsed.data).toBe('test');
    expect(parsed.success).toBe(true);
  });

  test('handles network timeout', async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // never resolves

    const result = await tools.apiClient.execute({ url: 'https://api.test', timeout: 1000 });
    expect(result).toContain('timeout');
  });
});
```

### Mocking fs

```javascript
const fs = require('fs/promises');
const path = require('path');

jest.mock('fs/promises');

describe('fileReader', () => {
  test('reads file successfully', async () => {
    fs.readFile.mockResolvedValue('file content');

    const result = await tools.readFile.execute({ path: 'test.txt' });
    expect(result).toBe('file content');
    expect(fs.readFile).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test.txt'), 'utf-8');
  });

  test('rejects outside workspace', async () => {
    fs.readFile.mockResolvedValue('content');  // should not be called

    const result = await tools.readFile.execute({ path: '../../../etc/passwd' });
    expect(result).toContain('Access denied');
    expect(fs.readFile).not.toHaveBeenCalled();
  });
});
```

### Mocking child_process

```javascript
const { exec } = require('child_process');

jest.mock('child_process');

describe('gitTool', () => {
  test('executes git command', async () => {
    exec.mockImplementation((cmd, args, opts, cb) => {
      cb(null, 'output', '');
    });

    const result = await tools.gitStatus.execute({});
    expect(exec).toHaveBeenCalledWith('git', ['status'], expect.anything(), expect.anything());
    expect(result).toContain('output');
  });

  test('handles command error', async () => {
    exec.mockImplementation((cmd, args, opts, cb) => {
      cb(new Error('fatal: not a git repository'), '', 'error');
    });

    const result = await tools.gitStatus.execute({});
    expect(result).toContain('Error');
  });
});
```

### Coverage

```bash
npx jest --coverage
```

Target: >80% line coverage for critical tools.

## Integration Tests

For tools that work with real APIs:

```javascript
// __tests__/apiClient.integration.test.js
const tools = require('../api-client.js');

describe('apiClient (integration)', () => {
  let originalApiKey;

  beforeAll(() => {
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = process.env.TEST_API_KEY;  // test key
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  test('real API call', async () => {
    const result = await tools.apiClient.execute({
      url: 'https://api.example.com/v1/health'
    });

    expect(result).not.toContain('Error');
    const parsed = typeof result === 'object' ? result : JSON.parse(result);
    expect(parsed.status).toBe('ok');
  }, 10000);  // Jest timeout 10s
});
```

**Run only integration tests:**

```bash
npx jest --testPathPattern=integration
```

## Security Tests

### SSRF test

```javascript
test('blocks private IP ranges', async () => {
  const result = await tools.apiClient.execute({
    url: 'http://169.254.169.254/latest/meta-data/'
  });
  expect(result).toContain('not allowed');
  expect(result).not.toContain('169.254');
});

test('blocks localhost', async () => {
  const result = await tools.apiClient.execute({ url: 'http://localhost:8080/admin' });
  expect(result).toContain('not allowed');
});
```

### Path traversal test

```javascript
test('prevents directory traversal', async () => {
  const result = await tools.readFile.execute({
    path: '../../../etc/passwd'
  });
  expect(result).toContain('Access denied');
  expect(result).toContain('outside workspace');
});
```

### Command injection test

```javascript
test('escapes shell commands', async () => {
  const result = await tools.gitCommit.execute({
    message: '"; rm -rf /"'
  });
  // Should escape or validate
  expect(result).not.toContain('rm -rf');
  expect(result).toContain('invalid');  // or similar
});
```

## Performance Tests

For tools handling large volumes:

```javascript
test('processes 1000 files within 10s', async () => {
  const start = Date.now();
  const result = await tools.batchProcess.execute({
    directory: './test-fixtures/large',
    operation: 'rename'
  });
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(10000);
  expect(result.count).toBe(1000);
});
```

## Test Fixtures

Create `test-fixtures/` directory:

```
test-fixtures/
├── files/
│   ├── small.txt
│   ├── large.bin (10MB)
│   └── invalid.json
├── api-responses/
│   ├── success.json
│   └── error-401.json
└── snapshots/
    └── expected-output.txt
```

Use in tests:

```javascript
const fixture = fs.readFileSync(path.join(__dirname, 'test-fixtures/files/small.txt'), 'utf-8');
```

## Mock Server for API

For integration tests use `nock`:

```bash
npm install --save-dev nock
```

```javascript
const nock = require('nock');

beforeAll(() => {
  nock('https://api.example.com')
    .get('/health')
    .reply(200, { status: 'ok' })
    .persist();  // all calls return this
});

afterAll(() => {
  nock.cleanAll();
});
```

## Continuous Integration

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:security": "jest --testPathPattern=security",
    "validate": "node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ."
  }
}
```

**.github/workflows/test.yml** (GitHub Actions):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - run: npm run validate
      - run: npm test
      - run: npm run test:security
```

## Debug Failing Tests

### Increase Jest timeout

```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000  // 30s for long-running tests
};
```

### Debug with console.log

```javascript
test('debug example', async () => {
  console.log('Debug: params =', params);
  const result = await tool.execute(params);
  console.log('Debug: result =', result);
  expect(result).toContain('Success');
});
```

### Run single test

```bash
npx jest --testNamePattern="handles HTTP 401"
```

## Test Coverage Checklist

For each tool:

- [ ] **Happy path** — valid parameters return expected result
- [ ] **Missing required** — absence of required parameters yields error
- [ ] **Invalid types** — wrong types (string instead of number) are rejected
- [ ] **Edge cases** — boundary values (empty string, 0, null, huge numbers)
- [ ] **Network errors** — fetch times out, returns 500
- [ ] **File system errors** — file not found, permission denied
- [ ] **Command errors** — command exits with non-zero code
- [ ] **Security scenarios** — SSRF, path traversal, command injection attempts
- [ ] **Idempotency** — repeated calls yield same result (where applicable)

## Tool Validation Evidence

To validate a tool:

```bash
# 1. Static validation
node ~/.roo/skills/custom-tool-creator/scripts/validate_tools.js ~/.roo/tools/my-tool.js

# 2. Unit tests
cd ~/.roo/tools
npm test

# 3. Integration tests (optional)
npm run test:integration

# 4. Security tests
npm run test:security

# 5. Manual test
node ~/.roo/skills/custom-tool-creator/scripts/test_tools_interactively.js ~/.roo/tools/my-tool.js
```

## Example Full Test Suite for API Client

```javascript
// api-client.test.js (unit + security)
const apiClient = require('../api-client.js');

describe('apiClient', () => {
  describe('Parameter validation', () => {
    test('requires url', async () => {
      const result = await apiClient.execute({});
      expect(result.error || result).toMatch(/url/);
    });

    test('validates URL format', async () => {
      const result = await apiClient.execute({ url: 'not-a-url' });
      expect(result.error || result).toMatch(/valid URL/);
    });
  });

  describe('HTTP layer', () => {
    test('handles 200 OK', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
      );
      const result = await apiClient.execute({ url: 'https://api.test' });
      expect(result.ok).toBe(true);
    });

    test('handles 401 Unauthorized', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve('Unauthorized') })
      );
      const result = await apiClient.execute({ url: 'https://api.test' });
      expect(result).toContain('401');
    });
  });

  describe('Security', () => {
    test('blocks localhost', async () => {
      const result = await apiClient.execute({ url: 'http://localhost:8080' });
      expect(result).toContain('not allowed');
    });

    test('blocks metadata IP', async () => {
      const result = await apiClient.execute({ url: 'http://169.254.169.254/latest/meta-data/' });
      expect(result).toContain('not allowed');
    });
  });

  describe('Timeouts', () => {
    test('returns timeout after 30s', async () => {
      global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
      const result = await apiClient.execute({ url: 'https://api.test', timeout: 1000 });
      expect(result).toContain('timeout');
    }, 5000);  // Jest timeout 5s
  });
});
```

---

**Next:** After testing, study [07-deployment.md](07-deployment.md) for activation and troubleshooting.
