// ~/.roo/tools/file-ops.js
const fs = require('fs/promises');
const path = require('path');

function isWithinWorkspace(filePath) {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, filePath);
  return resolved.startsWith(path.resolve(workspaceRoot) + path.sep);
}

module.exports.safeReadFile = {
  name: 'safe_read_file',
  description: 'Read file from workspace with size limit. Use for any file reading operations.',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to file relative to workspace root'
      },
      maxSize: {
        type: 'number',
        default: 1024 * 1024,
        description: 'Maximum file size in bytes (default 1MB)'
      },
      encoding: {
        type: 'string',
        enum: ['utf-8', 'utf-16', 'ascii', 'base64'],
        default: 'utf-8',
        description: 'File encoding'
      }
    },
    required: ['filePath']
  },
  async execute({ filePath, maxSize, encoding = 'utf-8' }) {
    // Workspace restriction
    if (!isWithinWorkspace(filePath)) {
      return 'Error: Access denied (outside workspace)';
    }

    const fullPath = path.join(process.cwd(), filePath);

    try {
      const stats = await fs.stat(fullPath);

      // Size check
      if (stats.size > maxSize) {
        return `Error: File too large (${stats.size} bytes > ${maxSize} bytes)`;
      }

      // Read file
      const content = await fs.readFile(fullPath, encoding);

      // For binary, convert to base64
      if (encoding === 'base64') {
        return { content: content.toString('base64'), size: stats.size };
      }

      return { content, size: stats.size };

    } catch (error) {
      if (error.code === 'ENOENT') {
        return `Error: File not found: ${filePath}`;
      }
      return `Error: ${error.message}`;
    }
  }
};

module.exports.safeWriteFile = {
  name: 'safe_write_file',
  description: 'Write content to file within workspace. Creates parent directories automatically.',
  parameters: {
    type: 'object',
    properties: {
      filePath: { type: 'string', description: 'Path to file (within workspace)' },
      content: { type: 'string', description: 'Content to write' },
      append: { type: 'boolean', default: false, description: 'Append instead of overwrite' }
    },
    required: ['filePath', 'content']
  },
  async execute({ filePath, content, append = false }) {
    if (!isWithinWorkspace(filePath)) {
      return 'Error: Access denied (outside workspace)';
    }

    const fullPath = path.join(process.cwd(), filePath);

    try {
      // Create parent directories
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      if (append) {
        await fs.appendFile(fullPath, content, 'utf-8');
      } else {
        await fs.writeFile(fullPath, content, 'utf-8');
      }

      const stats = await fs.stat(fullPath);
      return { success: true, bytes: stats.size, mode: append ? 'append' : 'write' };

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
