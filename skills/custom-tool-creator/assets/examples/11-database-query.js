// Example 11: Database Query
// Demonstrates SQL execution (requires database driver)

// Note: Add appropriate database driver to package.json
// For PostgreSQL: "pg": "^8.11.0"
// For MySQL: "mysql2": "^3.6.0"

module.exports = async function({ parameters, context }) {
  const { query, database } = parameters;

  // Get database connection string from vault
  const dbUrl = context.vault.get('DATABASE_URL');
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set in vault');
  }

  context.log('Executing query on:', database || 'default');

  // Database query implementation would go here
  // const { Client } = require('pg');
  // const client = new Client({ connectionString: dbUrl });
  // await client.connect();
  // const result = await client.query(query);
  // await client.end();

  return {
    success: true,
    message: 'Database query simulated (add pg/mysql2 package for real queries)',
    query,
    database,
    note: 'Never expose database credentials. Use vault and parameterized queries!'
  };
};

/**
 * SECURITY WARNING:
 * - Always use parameterized queries to prevent SQL injection
 * - Validate user-provided queries (or restrict to allowlist)
 * - Use read-only database credentials for query tools
 * Required permissions: VaultRead
 */