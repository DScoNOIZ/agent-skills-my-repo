// Example 20: HTML Parser
// Demonstrates structured HTML parsing with jsdom

// For production, add "jsdom" to package.json

module.exports = async function({ parameters }) {
  const { html, selector, attribute } = parameters;

  if (!html) throw new Error('html parameter required');

  // This is a structural example. For real parsing:
  // const { JSDOM } = require('jsdom');
  // const dom = new JSDOM(html);
  // const document = dom.window.document;
  // const elements = document.querySelectorAll(selector);

  // For now, demonstrate structure without dependency
  const stats = {
    length: html.length,
    lines: html.split('\n').length,
    tags: (html.match(/<[^>]+>/g) || []).length,
    closingTags: (html.match(/<\/[^>]+>/g) || []).length,
    comments: (html.match(/<!--[\s\S]*?-->/g) || []).length
  };

  return {
    success: true,
    message: 'HTML structure analyzed. Add jsdom package for actual parsing.',
    stats,
    note: 'Install jsdom to enable querySelector functionality'
  };
};

/**
 * To enable full HTML parsing:
 * 1. npm install jsdom
 * 2. Uncomment the JSDOM code above
 * 3. Use document.querySelectorAll(selector) to extract elements
 *
 * Common use cases:
 * - Scraping data from HTML
 * - Validating HTML structure
 * - Extracting meta tags
 * - Converting to Markdown
 */