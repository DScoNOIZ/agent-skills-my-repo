// ~/.roo/tools/git-ops.js
const { exec } = require('child_process');

function execAsync(command, args = [], timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timeout after ${timeout}ms`));
    }, timeout);

    exec(command, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      clearTimeout(timer);
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

const ALLOWED_COMMANDS = {
  'git': ['status', 'diff', 'log', 'add', 'commit', 'push', 'pull', 'checkout', 'branch']
};

module.exports.gitStatus = {
  name: 'git_status',
  description: 'Get git status of the repository',
  parameters: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        default: '.',
        description: 'Git repository directory (within workspace)'
      }
    },
    required: []
  },
  async execute({ directory = '.' }) {
    const fullDir = path.resolve(process.cwd(), directory);
    return execAsync('git', ['status', '--porcelain'], 10000);
  }
};

module.exports.gitCommit = {
  name: 'git_commit',
  description: 'Stage all changes and create a commit. Requires git repository in current directory.',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Commit message (1-100 chars)'
      },
      branch: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_\\-/]+$',
        description: 'Optional branch name to checkout first (feature/, bugfix/, etc.)'
      },
      amend: {
        type: 'boolean',
        default: false,
        description: 'Amend previous commit instead of creating new'
      }
    },
    required: ['message']
  },
  async execute({ message, branch, amend = false }) {
    // Validate command whitelist
    if (!ALLOWED_COMMANDS['git'].includes('commit')) {
      return 'Error: git commit not allowed';
    }

    try {
      // Optional branch checkout
      if (branch) {
        await execAsync('git', ['checkout', branch], 15000);
      }

      // Stage all
      await execAsync('git', ['add', '-A'], 10000);

      // Commit
      const args = ['commit', '-m', message];
      if (amend) args.push('--amend');
      const result = await execAsync('git', args, 10000);

      return { success: true, output: result, branch: branch || 'current' };

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
