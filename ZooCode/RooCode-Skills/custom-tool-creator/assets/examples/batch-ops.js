// ~/.roo/tools/batch-ops.js
const fs = require('fs/promises');
const path = require('path');

module.exports.batchRename = {
  name: 'batch_rename',
  description: 'Mass rename files in directory using regex pattern. Useful for refactoring file names.',
  parameters: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        default: '.',
        description: 'Directory containing files (must be within workspace)'
      },
      pattern: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Regex pattern (e.g., "^(.*)\\.js$" to capture extension)'
          },
          to: {
            type: 'string',
            description: 'Replacement string (use $1, $2 for captured groups)'
          }
        },
        required: ['from', 'to']
      },
      dryRun: {
        type: 'boolean',
        default: false,
        description: 'Show what would be renamed without actually doing it'
      }
    },
    required: ['pattern']
  },
  async execute({ directory, pattern, dryRun = false }) {
    const { from, to } = pattern;

    // Validate regex
    let regex;
    try {
      regex = new RegExp(from);
    } catch (e) {
      return `Error: Invalid regex pattern: ${e.message}`;
    }

    // Workspace check
    const fullDir = path.resolve(process.cwd(), directory);
    if (!fullDir.startsWith(process.cwd() + path.sep)) {
      return 'Error: Directory outside workspace';
    }

    try {
      const files = await fs.readdir(fullDir);
      const renamed = [];

      for (const file of files) {
        const newName = file.replace(regex, to);
        if (newName !== file) {
          if (!dryRun) {
            await fs.rename(
              path.join(fullDir, file),
              path.join(fullDir, newName)
            );
          }
          renamed.push({ from: file, to: newName });
        }
      }

      return {
        total: files.length,
        renamed: renamed.length,
        files: renamed,
        dryRun
      };

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
