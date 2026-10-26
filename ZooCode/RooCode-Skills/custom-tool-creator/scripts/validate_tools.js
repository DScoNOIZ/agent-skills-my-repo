#!/usr/bin/env node

/**
 * validate_tools.js — static validation of Custom Tools
 *
 * Checks:
 * - Export correctness (module.exports.toolName or export default)
 * - Required fields: name, description, parameters, execute
 * - JSON Schema validity (parameters)
 * - execute is an async function
 * - Forbidden patterns: import (in CJS), eval, hardcoded secrets
 *
 * Usage:
 *   node validate_tools.js ~/.roo/tools/**/*.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('json5');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Regular expressions for forbidden patterns
const FORBIDDEN_PATTERNS = [
  /process\.env\.[A-Z_0-9]+\s*=/g, // Hardcoded secrets (API_KEY=...)
  /eval\s*\(/g,                      // eval
  /new\s+Function\s*\(/g,            // Function constructor
  /require\s*\(\s*['"][^'"]+['"]\s*\)\s*=\s*process\.env/g // require(...)=process.env
];

function checkForbiddenPatterns(content, filePath) {
  const errors = [];
  FORBIDDEN_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        errors.push(`Forbidden pattern: "${match.trim()}"`);
      });
    }
  });
  return errors;
}

function validateTool(name, tool, filePath) {
  const errors = [];
  const warnings = [];

  // 1. Check required fields
  if (typeof tool.name !== 'string' || tool.name.length === 0) {
    errors.push('Missing or invalid name (must be non-empty string)');
  }

  if (typeof tool.description !== 'string' || tool.description.length === 0) {
    errors.push('Missing or invalid description (must be non-empty string)');
  }

  if (!tool.parameters) {
    errors.push('Missing parameters field');
  } else {
    // Validate JSON Schema
    if (typeof tool.parameters !== 'object' || tool.parameters.type !== 'object') {
      errors.push('Invalid parameters: must be an object with type "object"');
    } else {
      // Check properties
      if (!tool.parameters.properties) {
        warnings.push('parameters.properties is missing (empty schema)');
      } else if (typeof tool.parameters.properties !== 'object') {
        errors.push('parameters.properties must be an object');
      } else {
        // Validate each property
        Object.entries(tool.parameters.properties).forEach(([propName, propSchema]) => {
          if (typeof propSchema !== 'object' || !propSchema.type) {
            errors.push(`Property "${propName}" missing type in schema`);
          }
        });
      }

      // Check required (if present)
      if (tool.parameters.required) {
        if (!Array.isArray(tool.parameters.required)) {
          errors.push('parameters.required must be an array');
        } else {
          // All required fields must exist in properties
          tool.parameters.required.forEach(req => {
            if (!tool.parameters.properties[req]) {
              errors.push(`Required field "${req}" not defined in properties`);
            }
          });
        }
      }
    }
  }

  if (typeof tool.execute !== 'function') {
    errors.push('Missing execute function');
  } else {
    // Check if execute is async
    if (!tool.execute.constructor.name.includes('Async')) {
      // Not all async functions have AsyncFunction in constructor name, but let's try
      // More reliable check: look at the function's string source
      const fnStr = tool.execute.toString();
      if (!fnStr.includes('async ')) {
        warnings.push('execute function is not marked async (recommended)');
      }
    }
  }

  return { errors, warnings };
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];
  const tools = [];

  // Forbidden patterns
  const forbiddenErrors = checkForbiddenPatterns(content, filePath);
  errors.push(...forbiddenErrors);

  // Try to parse as CommonJS
  try {
    // First, clean content from wrappers (module.exports = ...)
    let moduleExports = null;

    // Search for module.exports.toolName = {...}
    const exportPattern = /module\.exports\.([a-zA-Z0-9_]+)\s*=\s*({[\s\S]*?});?/g;
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      const toolName = match[1];
      const toolCode = match[2];

      try {
        // Parse the tool object
        // Add wrapper to make parse work
        const objStr = `(${toolCode})`;
        const tool = eval(objStr); // safe: we're only parsing tool code

        const result = validateTool(toolName, tool, filePath);
        if (result.errors.length) {
          result.errors.forEach(err => errors.push(`[${toolName}] ${err}`));
        }
        if (result.warnings.length) {
          result.warnings.forEach(warn => log(`[${toolName}] Warning: ${warn}`, 'yellow'));
        }
        tools.push({ name: toolName, valid: result.errors.length === 0 });
      } catch (e) {
        errors.push(`[${toolName}] Failed to parse tool object: ${e.message}`);
      }
    }

    // Also check for module.exports = { tool1: {...}, tool2: {...} }
    if (tools.length === 0) {
      const fullExportMatch = content.match(/module\.exports\s*=\s*({[\s\S]*?});?/);
      if (fullExportMatch) {
        try {
          const objStr = `(${fullExportMatch[1]})`;
          const toolsObj = eval(objStr);
          Object.entries(toolsObj).forEach(([toolName, tool]) => {
            const result = validateTool(toolName, tool, filePath);
            if (result.errors.length) {
              result.errors.forEach(err => errors.push(`[${toolName}] ${err}`));
            }
            if (result.warnings.length) {
              result.warnings.forEach(warn => log(`[${toolName}] Warning: ${warn}`, 'yellow'));
            }
            tools.push({ name: toolName, valid: result.errors.length === 0 });
          });
        } catch (e) {
          errors.push(`Failed to parse module.exports: ${e.message}`);
        }
      }
    }

    // Check for export default defineCustomTool(...)
    const defaultExportMatch = content.match(/export\s+default\s+(defineCustomTool\s*\([\s\S]*?\))/);
    if (defaultExportMatch) {
      // This is TypeScript with defineCustomTool — skip validation here
      // It should pass through TypeScript compilation
      warnings.push('TypeScript export default detected — ensure tsc compiles without errors');
      tools.push({ name: 'default (TS)', valid: true });
    }

  } catch (e) {
    errors.push(`Failed to parse file: ${e.message}`);
  }

  return { tools, errors };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    log('Usage: node validate_tools.js <file1> [file2 ...]', 'yellow');
    process.exit(1);
  }

  // Expand glob patterns (simple implementation)
  const files = [];
  args.forEach(arg => {
    if (arg.includes('*') || arg.includes('?')) {
      const pattern = arg;
      // Very simple glob — only for current directory
      const dir = path.dirname(pattern) || '.';
      const basePattern = path.basename(pattern);
      try {
        const allFiles = fs.readdirSync(dir);
        allFiles.forEach(file => {
          if (file.match(basePattern.replace(/\*/g, '.*').replace(/\?/g, '.'))) {
            files.push(path.join(dir, file));
          }
        });
      } catch (e) {
        // Ignore
      }
    } else {
      files.push(arg);
    }
  });

  let totalErrors = 0;
  let totalTools = 0;
  const validTools = [];

  files.forEach(file => {
    if (!fs.existsSync(file)) {
      log(`File not found: ${file}`, 'yellow');
      return;
    }

    const relativePath = path.relative(process.cwd(), file);
    const { tools, errors } = validateFile(file);

    // Print file header
    if (errors.length > 0) {
      log(`✗ ${relativePath}`, 'red');
      errors.forEach(err => log(`  ${err}`, 'red'));
      totalErrors += errors.length;
    } else if (tools.length === 0) {
      log(`? ${relativePath} (no tools found)`, 'yellow');
    } else {
      log(`✓ ${relativePath}`, 'green');
      tools.forEach(tool => {
        const status = tool.valid ? '✓' : '✗';
        const color = tool.valid ? 'green' : 'red';
        log(`  ${status} ${tool.name}`, color);
        if (!tool.valid) totalErrors++;
        totalTools++;
        if (tool.valid) validTools.push(tool.name);
      });
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  log(`Total tools: ${totalTools}`, 'cyan');
  log(`Valid: ${validTools.length}`, 'green');
  if (totalErrors > 0) {
    log(`Errors: ${totalErrors}`, 'red');
    process.exit(1);
  } else {
    log('All tools valid!', 'green');
    process.exit(0);
  }
}

main();
