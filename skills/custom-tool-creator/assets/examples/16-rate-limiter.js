// Example 16: Rate Limiter
// Demonstrates token bucket algorithm for API rate limiting

module.exports = async function({ parameters, context }) {
  const { tokens = 10, refillRate = 1, refillInterval = 1000 } = parameters;

  // Use workspace data dir for persistent token bucket state
  const stateDir = context.workspace.dataDir('rate-limiter');
  const stateFile = `${stateDir}/state.json`;

  // Ensure directory exists
  try { await context.fs.mkdir(stateDir, { recursive: true }); } catch {}

  // Load or initialize state
  let state = { tokens: tokens, lastRefill: Date.now() };
  try {
    const saved = await context.fs.readFile(stateFile, 'utf8');
    state = JSON.parse(saved);
  } catch {
    // No saved state
  }

  // Refill tokens based on elapsed time
  const now = Date.now();
  const elapsed = now - state.lastRefill;
  const tokensToAdd = Math.floor(elapsed / refillInterval) * refillRate;
  state.tokens = Math.min(tokens, state.tokens + tokensToAdd);
  state.lastRefill = now;

  // Check if we can proceed
  if (state.tokens < 1) {
    const waitTime = Math.ceil((1 - state.tokens) / refillRate) * refillInterval;
    return {
      success: false,
      rateLimited: true,
      waitMs: waitTime,
      message: `Rate limited. Try again in ${waitTime}ms`
    };
  }

  // Consume a token
  state.tokens--;

  // Save state
  await context.fs.writeFile(stateFile, JSON.stringify(state, null, 2));

  return {
    success: true,
    tokensRemaining: state.tokens,
    refillRate,
    nextRefillMs: refillInterval
  };
};

/**
 * Token bucket rate limiter. Useful for:
 * - Controlling API call frequency
 * - Preventing abuse
 * - Fair resource allocation
 *
 * Configuration:
 * - tokens: bucket capacity (max tokens)
 * - refillRate: tokens added per interval
 * - refillInterval: ms between refills
 */