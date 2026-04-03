// Example 7: Data Aggregator
// Demonstrates combining multiple API calls

module.exports = async function({ parameters, context }) {
  const { sources } = parameters;

  const apiKey = context.vault.get('API_KEY');
  if (!apiKey) throw new Error('API_KEY not set in vault');

  const results = [];
  const errors = [];

  // Fetch from multiple sources in parallel
  const promises = sources.map(async (source) => {
    try {
      context.log('Fetching from:', source);
      const response = await context.http.request({
        method: 'GET',
        url: source,
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      results.push({ source, data: response.body, success: true });
    } catch (error) {
      errors.push({ source, error: error.message });
      results.push({ source, success: false, error: error.message });
    }
  });

  await Promise.all(promises);

  return {
    success: errors.length === 0,
    total: sources.length,
    succeeded: results.filter(r => r.success).length,
    failed: errors.length,
    results,
    errors
  };
};

/**
 * Example input:
 * sources: ["https://api.example.com/data1", "https://api.example.com/data2"]
 */