// Example 2: API Caller with Vault
// Demonstrates HTTP requests and secret management

module.exports = async function({ parameters, context }) {
  const { endpoint } = parameters;

  // Get API key from vault (requires VaultRead permission)
  const apiKey = context.vault.get('API_KEY');
  if (!apiKey) {
    throw new Error('API_KEY not found in vault. Please set it in Roo settings.');
  }

  // Make HTTP request (requires Network permission)
  context.log('Making request to:', endpoint);
  const response = await context.http.request({
    method: 'GET',
    url: endpoint,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    success: true,
    status: response.status,
    data: response.body
  };
};

/**
 * Required permissions: Network, VaultRead
 * Required vault keys: API_KEY
 */