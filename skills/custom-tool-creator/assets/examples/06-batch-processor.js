// Example 6: Batch File Processor
// Demonstrates processing multiple files with async operations

module.exports = async function({ parameters, context }) {
  const { directory, pattern } = parameters;

  // Read directory contents (requires FileSystemRead permission)
  const files = await context.fs.readdir(directory);
  context.log('Found', files.length, 'files');

  const results = [];
  for (const file of files) {
    // Skip if doesn't match pattern (simple glob)
    if (pattern && !file.includes(pattern)) continue;

    const filePath = `${directory}/${file}`;
    try {
      const stat = await context.fs.stat(filePath);
      if (stat.isFile()) {
        const content = await context.fs.readFile(filePath, 'utf8');
        const stats = {
          file,
          size: content.length,
          lines: content.split('\n').length
        };
        results.push(stats);
      }
    } catch (error) {
      context.log.warn('Failed to process', filePath, error.message);
    }
  }

  return {
    success: true,
    processed: results.length,
    totalFiles: files.length,
    results
  };
};

/**
 * Example usage:
 * directory: "./data"
 * pattern: ".txt" (optional, filters files containing this substring)
 */