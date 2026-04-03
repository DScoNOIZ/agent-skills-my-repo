// Example 13: Advanced Error Handler
// Demonstrates proper error handling and retry logic

module.exports = async function({ parameters, context }) {
  const { operation, maxRetries = 3 } = parameters;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      context.log(`Attempt ${attempt}/${maxRetries}: ${operation}`);

      // Simulate operation that might fail
      const result = await performOperation(operation, context);

      return {
        success: true,
        result,
        attempts: attempt,
        message: `Succeeded after ${attempt} attempt(s)`
      };
    } catch (error) {
      lastError = error;
      context.log.warn('Attempt failed:', error.message);

      // Don't retry on certain errors
      if (error.code === 'VALIDATION_ERROR' || error.code === 'PERMISSION_DENIED') {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        context.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
};

async function performOperation(operation, context) {
  // Simulate random failure for demo
  if (Math.random() < 0.3) {
    const errors = [
      { message: 'Network timeout', code: 'TIMEOUT' },
      { message: 'Service unavailable', code: 'SERVICE_DOWN' },
      { message: 'Rate limit exceeded', code: 'RATE_LIMIT' },
      { message: 'Invalid input', code: 'VALIDATION_ERROR' }
    ];
    const error = errors[Math.floor(Math.random() * errors.length)];
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  return { operation, completedAt: new Date().toISOString() };
};

/**
 * Shows proper error handling with:
 * - Retry logic with exponential backoff
 * - Error classification (some errors shouldn't retry)
 * - Detailed logging for debugging
 * - Clear final error message
 */