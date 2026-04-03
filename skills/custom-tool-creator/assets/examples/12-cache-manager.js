// Example 12: Cache Manager
// Demonstrates persistent storage using workspace data dir

module.exports = async function({ parameters, context }) {
  const { action, key, value, ttl } = parameters;

  const cacheDir = context.workspace.dataDir('custom-tool-cache');
  const cacheFile = `${cacheDir}/cache.json`;

  // Ensure cache directory exists
  try {
    await context.fs.mkdir(cacheDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  // Read existing cache
  let cache = {};
  try {
    const cacheData = await context.fs.readFile(cacheFile, 'utf8');
    cache = JSON.parse(cacheData);
  } catch {
    // No existing cache
  }

  const now = Date.now();
  const result = { success: true, action };

  switch (action) {
    case 'set':
      cache[key] = {
        value,
        expires: ttl ? now + ttl * 1000 : null
      };
      break;

    case 'get':
      if (cache[key]) {
        const entry = cache[key];
        if (entry.expires && now > entry.expires) {
          delete cache[key];
          result.found = false;
          result.message = 'Key expired';
        } else {
          result.found = true;
          result.value = entry.value;
        }
      } else {
        result.found = false;
        result.message = 'Key not found';
      }
      break;

    case 'delete':
      delete cache[key];
      result.deleted = true;
      break;

    case 'clear':
      cache = {};
      result.cleared = true;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  // Write updated cache
  await context.fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));

  return result;
};

/**
 * Demonstrates using workspace.dataDir() for persistent storage.
 * This directory is skill-specific and persists across sessions.
 * Required permissions: FileSystemRead, FileSystemWrite
 */