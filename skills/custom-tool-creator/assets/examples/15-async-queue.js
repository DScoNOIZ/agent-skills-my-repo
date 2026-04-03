// Example 15: Async Queue Processor
// Demonstrates controlled concurrency with async operations

module.exports = async function({ parameters, context }) {
  const { items, concurrency = 3, operation } = parameters;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  context.log(`Processing ${items.length} items with concurrency ${concurrency}`);

  const results = [];
  const errors = [];
  let currentIndex = 0;

  // Worker function
  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];

      try {
        context.log.debug(`Processing item ${index + 1}/${items.length}:`, item);
        const result = await processItem(item, operation, context);
        results.push({ index, item, result, success: true });
      } catch (error) {
        context.log.error(`Failed to process item ${index}:`, error.message);
        errors.push({ index, item, error: error.message });
        results.push({ index, item, success: false, error: error.message });
      }
    }
  }

  // Start worker pool
  const workers = Array(Math.min(concurrency, items.length)).fill(null).map(worker);
  await Promise.all(workers);

  return {
    success: errors.length === 0,
    total: items.length,
    processed: results.length,
    errors: errors.length,
    results,
    errors
  };
};

async function processItem(item, operation, context) {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulate occasional failure
  if (Math.random() < 0.1) {
    throw new Error(`Simulated processing error for item: ${item}`);
  }

  return {
    item,
    operation,
    processedAt: new Date().toISOString(),
    value: `processed_${item}`
  };
};

/**
 * Useful for:
 * - Processing large datasets without overwhelming resources
 * -API batch requests with rate limiting
 * -File batch operations
 * -Controlling parallel execution
 */