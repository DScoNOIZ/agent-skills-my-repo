// Example 19: Crypto Utilities
// Demonstrates hashing and encryption (built-in Node.js crypto)

const crypto = require('crypto');

module.exports = async function({ parameters }) {
  const { action, input, algorithm = 'sha256', key, iv } = parameters;

  const result = { success: true, action, algorithm };

  switch (action) {
    case 'hash':
      if (!input) throw new Error('input required for hash');
      const hash = crypto.createHash(algorithm).update(input).digest('hex');
      result.hash = hash;
      break;

    case 'hmac':
      if (!input || !key) throw new Error('input and key required for hmac');
      const hmac = crypto.createHmac(algorithm, key).update(input).digest('hex');
      result.hmac = hmac;
      break;

    case 'encrypt':
      if (!input || !key || !iv) {
        throw new Error('input, key, and iv required for encrypt');
      }
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
      let encrypted = cipher.update(input, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      result.encrypted = encrypted;
      break;

    case 'decrypt':
      if (!input || !key || !iv) {
        throw new Error('input, key, and iv required for decrypt');
      }
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
      let decrypted = decipher.update(input, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      result.decrypted = decrypted;
      break;

    case 'random':
      const bytes = input && parseInt(input) ? parseInt(input) : 32;
      const random = crypto.randomBytes(bytes).toString('hex');
      result.random = random;
      result.bytes = bytes;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return result;
};

/**
 * Cryptographic utilities using Node.js built-in crypto module.
 * No external dependencies required.
 *
 * Security Notes:
 * - Never hardcode encryption keys
 * - Use vault for storing secrets
 * - Prefer AES-256-GCM for new implementations
 * - Rotate keys regularly
 */