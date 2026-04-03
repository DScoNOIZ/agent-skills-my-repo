// Example 10: Image Resizer
// Demonstrates binary data handling (requires sharp or jimp)

// Note: For production use, add 'sharp' or 'jimp' to package.json

module.exports = async function({ parameters, context }) {
  const { inputPath, outputPath, width, height } = parameters;

  context.log('Processing image:', inputPath);

  // Read image as buffer (requires FileSystemRead)
  const imageBuffer = await context.fs.readFile(inputPath);

  // Image processing would go here with sharp/jimp
  // const sharp = require('sharp');
  // await sharp(imageBuffer)
  //   .resize(width, height)
  //   .toFile(outputPath);

  // For now, just copy the file
  await context.fs.writeFile(outputPath || inputPath, imageBuffer);

  return {
    success: true,
    message: 'Image processed (placeholder - add sharp library for real processing)',
    stats: {
      inputSize: imageBuffer.length,
      requestedWidth: width,
      requestedHeight: height
    }
  };
};

/**
 * To enable real image processing:
 * 1. Add to package.json: "sharp": "^0.33.0"
 * 2. Uncomment sharp code above
 * Required permissions: FileSystemRead, FileSystemWrite
 */