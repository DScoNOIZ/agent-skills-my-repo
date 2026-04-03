// Example 1: Simple Echo Tool
// Demonstrates basic parameter handling and return values

module.exports = async function({ parameters }) {
  const { message } = parameters;
  return {
    success: true,
    data: {
      original: message,
      reversed: message.split('').reverse().join(''),
      uppercase: message.toUpperCase(),
      lowercase: message.toLowerCase()
    }
  };
};

/**
 * SKILL.md example:
 *
 * parameters:
 *   schema:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: Message to process
 *     required: [message]
 */