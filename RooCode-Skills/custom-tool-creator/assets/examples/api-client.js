// ~/.roo/tools/api-client.js
const MAX_RETRIES = 3;

module.exports.apiClient = {
  name: 'api_client',
  description: 'HTTP client with retry logic, URL validation, and timeout. Use for REST API calls.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Full API endpoint URL (must be https:// and whitelisted host)'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
        description: 'HTTP method'
      },
      body: {
        type: 'object',
        description: 'JSON body for POST/PUT requests'
      },
      timeout: {
        type: 'number',
        default: 30000,
        minimum: 1000,
        maximum: 120000,
        description: 'Timeout in milliseconds (1-120s)'
      }
    },
    required: ['url']
  },
  async execute({ url, method = 'GET', body, timeout = 30000 }) {
    // 1. URL validation (SSRF prevention)
    if (!url.startsWith('https://')) {
      return 'Error: Only HTTPS URLs allowed';
    }

    const allowedHosts = ['api.example.com', 'github.com', 'api.openai.com'];
    try {
      const hostname = new URL(url).hostname;
      if (!allowedHosts.some(allowed => hostname.endsWith(allowed))) {
        return `Error: Host ${hostname} not in whitelist`;
      }
    } catch (e) {
      return `Error: Invalid URL: ${e.message}`;
    }

    // 2. Retry loop
    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY || ''}`
          },
          signal: controller.signal
        };

        if (body && ['POST', 'PUT'].includes(method)) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        clearTimeout(timer);

        if (!response.ok) {
          const errorText = await response.text();
          return `HTTP ${response.status}: ${errorText}`;
        }

        return await response.json();

      } catch (error) {
        lastError = error;
        if (i < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
    }

    return `Error: Failed after ${MAX_RETRIES} retries: ${lastError.message}`;
  }
};
