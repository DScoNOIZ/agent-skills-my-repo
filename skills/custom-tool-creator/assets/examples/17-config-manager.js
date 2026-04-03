// Example 17: Configuration Manager
// Demonstrates reading/writing structured configuration

module.exports = async function({ parameters, context }) {
  const { action, key, value, configName = 'app' } = parameters;

  const configDir = context.workspace.dataDir('configs');
  const configFile = `${configDir}/${configName}.json`;

  // Ensure directory exists
  try { await context.fs.mkdir(configDir, { recursive: true }); } catch {}

  // Load existing config
  let config = {};
  try {
    const data = await context.fs.readFile(configFile, 'utf8');
    config = JSON.parse(data);
  } catch {
    // No existing config
  }

  const result = { success: true, action, configName };

  switch (action) {
    case 'get':
      if (!key) {
        result.data = config;
      } else {
        result.value = config[key];
        result.found = key in config;
      }
      break;

    case 'set':
      if (!key) throw new Error('key is required for set action');
      config[key] = value;
      await context.fs.writeFile(configFile, JSON.stringify(config, null, 2));
      result.updated = true;
      break;

    case 'delete':
      if (!key) throw new Error('key is required for delete action');
      const deleted = delete config[key];
      await context.fs.writeFile(configFile, JSON.stringify(config, null, 2));
      result.deleted = deleted;
      break;

    case 'clear':
      config = {};
      await context.fs.writeFile(configFile, JSON.stringify(config, null, 2));
      result.cleared = true;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return result;
};

/**
 * Persistent configuration storage with namespacing.
 * Stores configs in workspace.dataDir() for persistence.
 * Supports multiple named configs (configName parameter).
 *
 * Examples:
 * - { action: 'set', key: 'apiUrl', value: 'https://api.example.com' }
 * - { action: 'get', key: 'apiUrl' }
 * - { action: 'get' } // returns entire config
 */