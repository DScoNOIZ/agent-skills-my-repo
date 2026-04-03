// ~/.roo/tools/db-query.js
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

module.exports.sqliteQuery = {
  name: 'sqlite_query',
  description: 'Execute SELECT query on SQLite database. Only SELECT statements allowed for security.',
  parameters: {
    type: 'object',
    properties: {
      dbPath: {
        type: 'string',
        description: 'Path to .sqlite file (must be within workspace)'
      },
      query: {
        type: 'string',
        description: 'SQL SELECT query (no INSERT/UPDATE/DELETE)'
      },
      params: {
        type: 'array',
        items: { type: 'string' },
        description: 'Query parameters for prepared statement'
      }
    },
    required: ['dbPath', 'query']
  },
  async execute({ dbPath, query, params = [] }) {
    // Workspace restriction
    if (!isWithinWorkspace(dbPath)) {
      return 'Error: Database file outside workspace';
    }

    // Security: only SELECT
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT')) {
      return 'Error: Only SELECT queries allowed';
    }

    // Whitelist tables (optional)
    const allowedTables = ['users', 'orders', 'products'];
    const tablePattern = /\bFROM\s+(\w+)/i;
    const match = query.match(tablePattern);
    if (match && !allowedTables.includes(match[1])) {
      return `Error: Table ${match[1]} not in whitelist`;
    }

    try {
      const db = await sqlite.open(dbPath);
      const rows = await db.all(query, params);
      await db.close();

      return {
        rows,
        count: rows.length,
        truncated: rows.length > 100 ? '(showing first 100 rows)' : ''
      };

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};

function isWithinWorkspace(filePath) {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, filePath);
  return resolved.startsWith(path.resolve(workspaceRoot) + path.sep);
}
