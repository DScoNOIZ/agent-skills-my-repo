// Example 5: Shell Command Executor
// Demonstrates running system commands (use with caution)

module.exports = async function({ parameters, context }) {
  const { command, args = [] } = parameters;

  context.log.warn('Executing shell command:', command, ...args);

  // IMPORTANT: Validate and sanitize user input when using shell!
  // Prefer passing args as array to avoid injection:
  // await context.shell.exec('ls', ['-la', userProvidedPath]);

  const result = await context.shell.exec(command, args, {
    timeout: 30000,
    maxBuffer: 1024 * 1024 // 1MB
  });

  return {
    success: result.code === 0,
    exitCode: result.code,
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: result.timedOut
  };
};

/**
 * WARNING: Shell permission is powerful and dangerous.
 * Always validate user input and avoid running untrusted commands.
 * Required permission: Shell
 */