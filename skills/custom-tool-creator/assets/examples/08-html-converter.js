// Example 8: HTML to Markdown Converter
// Demonstrates text transformation (no external dependencies)

module.exports = async function({ parameters, context }) {
  const { html, inline } = parameters;

  // Simple HTML to Markdown conversion
  let markdown = html
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    // Bold & Italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*>/gi, '\n')
    // Remove remaining tags if inline
    ...(inline ? [] : [['<[^>]+>/g', '']])
    // Trim
    .trim();

  return {
    success: true,
    markdown,
    stats: {
      htmlLength: html.length,
      markdownLength: markdown.length,
      reduction: Math.round((1 - markdown.length / html.length) * 100)
    }
  };
};

/**
 * Note: This is a simple converter. For production use,
 * consider using a library like 'turndown' via npm.
 */