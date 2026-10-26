# 04-execute: Best Practices for execute

`execute` is the entry point for your tool's logic. It's an async function that receives validated parameters and returns a result.

## Mandatory Rules

1. **Always async** — even if logic is synchronous, make `execute` async
2. **Try/catch** — handle all errors, never throw
3. **Timeouts** — all external calls ≤30s
4. **Logging** — use `console.log`/`console.error` for debugging
5. **Return string** (or object → auto-stringified)

## Execute Skeleton

```javascript
async execute(params) {
  try {
    // 1. Additional validation (defense in depth)
    if (!params.url) {
      return 'Error: url is required';
    }

    // 2. External call with timeout
    const result = await withTimeout(fetch(params.url), 30000);

    // 3. Response check
    if (!result.ok) {
      const errorText = await result.text();
      return `Error: HTTP ${result.status}: ${errorText}`;
    }

    // 4. Processing
    const data = await result.json();

    // 5. Return result (string or object)
    return JSON.stringify(data, null, 2);

  } catch (error) {
    // 6. Error handling
    console.error('[MyTool] Execution error:', error);
    return `Error: ${error.message}`;
  }
}
```

## Timeouts

All external operations (fetch, exec, db queries) **must** have a timeout.

### **Promise.race() pattern**

```javascript
function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### **AbortController (fetch)**

```javascript
async execute({ url }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return 'Error: Request timeout after 30s';
    }
    throw error;
  }
}
```

### **child_process with timeout**

```javascript
const { exec } = require('child_process');

async execute({ command, args = [] }) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // Need to kill the process
      resolve('Error: Command timeout');
    }, 30000);

    exec(command, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      clearTimeout(timer);
      if (error) {
        resolve(`Error: ${stderr || error.message}`);
      } else {
        resolve(stdout);
      }
    });
  });
}
```

## Error Handling

**Never throw** from `execute` — always return an error string.

```javascript
// ❌ BAD — throws exception
async execute(params) {
  const result = await fetch(params.url);
  if (!result.ok) {
    throw new Error('HTTP error');  // Roo will get a crash
  }
  return result.json();
}

// ✅ GOOD — returns error as string
async execute(params) {
  try {
    const result = await fetch(params.url);
    if (!result.ok) {
      return `Error: HTTP ${result.status}`;
    }
    return result.json();
  } catch (error) {
    console.error('[Tool] Failed:', error);
    return `Error: ${error.message}`;
  }
}
```

**User-friendly messages:**
- No stack traces in production
- Clearly explain what went wrong
- Suggest possible solution (if relevant)

```javascript
return `Error: Cannot connect to API. Check API_KEY environment variable and network.`;
```

## Logging

```javascript
async execute(params) {
  console.log('[MyTool] Started with params:', JSON.stringify(params, null, 2));

  const startTime = Date.now();

  try {
    const result = await doWork(params);
    const duration = Date.now() - startTime;
    console.log(`[MyTool] Completed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error('[MyTool] Failed:', error);
    return `Error: ${error.message}`;
  }
}
```

Logs are visible in **View → Output → "Roo Code"**.

## Return Types

**String (recommended):**
```javascript
return 'Success: File processed';
```

**Object (automatically stringified):**
```javascript
return { success: true, count: 42, skipped: 0 };
// Roo receives: '{"success":true,"count":42,"skipped":0}'
```

**Better control:**
```javascript
return JSON.stringify(result, null, 2);  // pretty print
```

**Buffer / Stream — NO:**
```javascript
// BAD — Roo cannot process
return fs.createReadStream('large.txt');
```

## Context Parameter

`execute` can accept a second parameter `context` (only for defineCustomTool):

```typescript
async execute(args, context?) {
  // context: { mode: string, task?: any }
  console.log(`Running in mode: ${context.mode}`);
  // mode: "code", "architect", "ask", "debug", etc.
}
```

Use this to adapt behavior based on mode.

## Idempotency

Where possible, make tools **idempotent** — repeated calls with same parameters should not change state or should yield same result.

```javascript
// Idempotent: reading a file
async execute({ filePath }) {
  return fs.readFile(filePath, 'utf-8');
}

// Non-idempotent: creates new file each time
async execute({ fileName }) {
  fs.writeFile(fileName, 'content');  // Overwrites — ok, but doesn't create new each time
}
```

## Retry Logic

For flaky APIs, use retry with exponential backoff:

```javascript
const MAX_RETRIES = 3;

async execute({ url }) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        const delay = 1000 * Math.pow(2, i);  // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  return `Error: Failed after ${MAX_RETRIES} retries: ${lastError.message}`;
}
```

## Memory Management

- **Don't accumulate large arrays** unnecessarily
- **Stream large files** instead of loading entirely into memory
- **Close connections** (db, ws) in `finally`

```javascript
async execute({ filePath }) {
  const file = await fs.open(filePath, 'r');
  try {
    // stream processing...
  } finally {
    await file.close();
  }
}
```

## Progress Feedback

Custom Tools **do not support** streaming responses or incremental returns. The entire result is a single string/object.

If operation is long-running (>10s), consider:
- **Splitting into multiple calls** (start first, then poll status)
- **Logging progress** (write to console, user sees in Output)

## Concurrency

If tool is invoked concurrently (unlikely but possible), protect shared resources:

```javascript
const lock = new Map();  // Module-level lock

async execute({ filePath }) {
  const key = filePath;
  if (lock.has(key)) {
    return 'Error: Another operation on this file is in progress';
  }
  lock.set(key, true);
  try {
    return await processFile(filePath);
  } finally {
    lock.delete(key);
  }
}
```

## Validation Inside Execute (Defense in Depth)

Even if JSON Schema validated types, business logic validation is your responsibility:

```javascript
async execute({ startDate, endDate }) {
  // 1. Date validity check
  if (new Date(startDate) > new Date(endDate)) {
    return 'Error: startDate cannot be after endDate';
  }

  // 2. Resource availability
  if (!await fileExists(startDate.sourceFile)) {
    return 'Error: Source file not found';
  }

  // 3. Quota check
  const size = await getFileSize(startDate.sourceFile);
  if (size > 100 * 1024 * 1024) {
    return 'Error: File too large (>100MB)';
  }

  // 4. Main logic
  return await processDateRange(startDate, endDate);
}
```

## Examples

### **HTTP GET with timeout and retry**

```javascript
const MAX_RETRIES = 3;

module.exports.apiGet = {
  name: 'api_get',
  description: 'HTTP GET with retry',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'API URL' },
      timeout: { type: 'number', default: 30000 }
    },
    required: ['url']
  },
  async execute({ url, timeout = 30000 }) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
          return `HTTP ${response.status}: ${await response.text()}`;
        }
        return response.json();
      } catch (error) {
        if (i === MAX_RETRIES - 1) {
          return `Error: ${error.message}`;
        }
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
};
```

### **File read with checks**

```javascript
module.exports.safeReadFile = {
  name: 'safe_read_file',
  description: 'Read file with size limit',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path within workspace' },
      maxSize: { type: 'number', default: 1024 * 1024, description: 'Max bytes (default 1MB)' }
    },
    required: ['path']
  },
  async execute({ path, maxSize }) {
    // Workspace restriction check
    if (!isWithinWorkspace(path)) {
      return 'Error: Access denied (outside workspace)';
    }

    try {
      const stats = await fs.stat(path);
      if (stats.size > maxSize) {
        return `Error: File too large (${stats.size} > ${maxSize} bytes)`;
      }

      const content = await fs.readFile(path, 'utf-8');
      return content;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
```

## Execute Checklist

- [ ] Function is declared `async`
- [ ] Has `try/catch` block
- [ ] All external calls (fetch, exec, db) have timeout ≤30s
- [ ] Returns string or serializable object
- [ ] No `throw` — only return error messages
- [ ] Logs key steps (`console.log`/`console.error`)
- [ ] Errors don't include stack traces in production (log them but return cleaned message)
- [ ] Resources (connections, files) are closed in `finally`
- [ ] Has defense-in-depth validation (checks business rules)
- [ ] Memory: no leaks, large data is streamed

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Not async | execute doesn't return Promise | Add `async` |
| Throwing errors | Roo crashes | Return error string |
| No timeout | Hangs for 5 minutes | Add `withTimeout` or AbortController |
| Returning Buffer | Roo can't process | Stringify: `buffer.toString()` |
| Closing stdout | `exec` loses output | Capture stdout/stderr in callback |

---

**Next:** Ensure your tool is secure — read [05-security.md](05-security.md).
