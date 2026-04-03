// Example 3: File Processor
// Demonstrates file system operations

module.exports = async function({ parameters, context }) {
  const { inputPath, outputPath, transform } = parameters;

  // Read input file (requires FileSystemRead permission)
  context.log('Reading:', inputPath);
  const content = await context.fs.readFile(inputPath, 'utf8');

  // Apply transformation
  let processed;
  switch (transform) {
    case 'uppercase':
      processed = content.toUpperCase();
      break;
    case 'lowercase':
      processed = content.toLowerCase();
      break;
    case 'reverse':
      processed = content.split('').reverse().join('');
      break;
    default:
      throw new Error(`Unknown transform: ${transform}`);
  }

  // Write output file (requires FileSystemWrite permission)
  context.log('Writing:', outputPath);
  await context.fs.writeFile(outputPath, processed, 'utf8');

  return {
    success: true,
    stats: {
      inputBytes: content.length,
      outputBytes: processed.length,
      transform: transform
    }
  };
};

/**
 * Required permissions: FileSystemRead, FileSystemWrite
 * Example paths: { inputPath: "./data/input.txt", outputPath: "./data/output.txt" }
 */