# 8. HTTP REQUESTS

## Built-in HTTP Support

No external library needed — use `context.http`:

```javascript
const response = await context.http.request({
  method: 'POST',
  url: 'https://api.example.com/data',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ key: 'value' })
});

return { data: response.body };
```

## Features

- Automatic JSON parsing
- Timeout handling
- Error propagation
- No dependency on `axios`/`node-fetch`

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | 'GET' | HTTP method |
| `url` | string | required | Target URL |
| `headers` | object | {} | Request headers |
| `body` | string/buffer | null | Request body |
| `timeout` | number | 30000 | Milliseconds |
| `maxRedirects` | number | 5 | Redirect limit |

## Response Object

```typescript
interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: any; // parsed JSON or raw string
  rawBody: Buffer;
}
```

→ Next: [File System](./09-filesystem.md) | [Logging](./10-logging.md)