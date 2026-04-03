// Example 4: JSON Formatter
// Demonstrates data transformation and validation

module.exports = async function({ parameters }) {
  const { jsonString, indent } = parameters;

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }

  const formatted = JSON.stringify(data, null, indent || 2);

  return {
    success: true,
    formatted,
    stats: {
      originalLength: jsonString.length,
      formattedLength: formatted.length,
      nodes: countJsonNodes(data)
    }
  };
};

function countJsonNodes(obj) {
  if (typeof obj !== 'object' || obj === null) return 1;
  let count = 1;
  if (Array.isArray(obj)) {
    for (const item of obj) count += countJsonNodes(item);
  } else {
    for (const value of Object.values(obj)) count += countJsonNodes(value);
  }
  return count;
}