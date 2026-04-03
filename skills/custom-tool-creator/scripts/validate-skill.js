#!/usr/bin/env node

/**
 * Skill Validation Script
 * Validates a skill directory structure and SKILL.md format
 *
 * Usage: node validate-skill.js [path-to-skill]
 *
 * This script helps developers check their skill before submission.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = ['SKILL.md', 'tool.js', 'tool.ts', 'tool.py'];
const REQUIRED_SKILL_FIELDS = ['name', 'id', 'version', 'description', 'implementation'];

function validateSkill(skillPath) {
  const errors = [];
  const warnings = [];
  const results = {
    valid: false,
    skillPath,
    errors,
    warnings,
    files: {},
    metadata: {}
  };

  // Check if directory exists
  if (!fs.existsSync(skillPath)) {
    errors.push(`Skill directory not found: ${skillPath}`);
    return results;
  }

  // Check for required files
  const files = fs.readdirSync(skillPath);
  const hasToolJs = files.includes('tool.js');
  const hasToolTs = files.includes('tool.ts');
  const hasToolPy = files.includes('tool.py');
  const hasSkil = files.includes('SKILL.md');

  if (!hasSkil) {
    errors.push('Missing required file: SKILL.md');
  } else {
    results.files.SKILL.md = true;
  }

  if (!hasToolJs && !hasToolTs && !hasToolPy) {
    errors.push('Missing implementation file: tool.js, tool.ts, or tool.py');
  } else {
    if (hasToolJs) results.files.tool.js = true;
    if (hasToolTs) results.files.tool.ts = true;
    if (hasToolPy) results.files.tool.py = true;
  }

  // Parse and validate SKILL.md
  if (hasSkil) {
    const skillContent = fs.readFileSync(path.join(skillPath, 'SKILL.md'), 'utf8');
    const yamlMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);

    if (!yamlMatch) {
      errors.push('SKILL.md must start with YAML frontmatter (--- delimiter)');
    } else {
      try {
        const yaml = parseYaml(yamlMatch[1]);
        results.metadata = yaml;

        // Check required fields
        for (const field of REQUIRED_SKILL_FIELDS) {
          if (!yaml[field]) {
            errors.push(`Missing required field in SKILL.md: ${field}`);
          }
        }

        // Validate implementation
        if (yaml.implementation) {
          if (!yaml.implementation.file) {
            errors.push('implementation.file is required');
          } else {
            const implFile = path.join(skillPath, yaml.implementation.file);
            if (!fs.existsSync(implFile)) {
              errors.push(`Implementation file not found: ${yaml.implementation.file}`);
            }
          }
        }

        // Validate permissions
        if (yaml.permissions && !Array.isArray(yaml.permissions)) {
          errors.push('permissions must be an array');
        }

        // Validate parameters schema
        if (yaml.parameters && yaml.parameters.schema) {
          warnings.push('Parameter schema found - ensure it is valid JSON Schema Draft 7');
        }

        // Check icon
        if (yaml.icon && !files.includes('icon.png')) {
          warnings.push('icon specified in SKILL.md but icon.png not found');
        }

      } catch (error) {
        errors.push(`Failed to parse SKILL.md YAML: ${error.message}`);
      }
    }
  }

  // Check optional common files
  if (files.includes('package.json')) {
    results.files.package.json = true;
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(skillPath, 'package.json'), 'utf8'));
      results.metadata.npmPackage = pkg.name;
    } catch (error) {
      warnings.push('package.json exists but is not valid JSON');
    }
  }

  if (fs.existsSync(path.join(skillPath, 'references'))) {
    results.files.references = true;
  }

  if (fs.existsSync(path.join(skillPath, 'assets'))) {
    results.files.assets = true;
  }

  results.valid = errors.length === 0;
  return results;
}

function parseYaml(yamlStr) {
  // Simple YAML parser for basic cases
  const result = {};
  const lines = yamlStr.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    // Handle arrays
    if (line.startsWith('- ')) {
      const value = line.substring(2);
      if (!Array.isArray(result._list)) result._list = [];
      result._list.push(parseValue(value));
      continue;
    }

    // Handle key-value pairs
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Handle nested objects (basic indentation)
      if (value === '') {
        result[key] = {};
        continue;
      }

      result[key] = parseValue(value);
    }
  }

  // Convert array
  if (result._list) {
    return result._list;
  }

  return result;
}

function parseValue(value) {
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);

  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

// Main execution
const skillPath = process.argv[2] || '.';
const results = validateSkill(skillPath);

console.log('\n=== Skill Validation Results ===');
console.log(`Skill: ${results.skillPath}`);
console.log(`Status: ${results.valid ? '✅ VALID' : '❌ INVALID'}`);

if (results.errors.length > 0) {
  console.log('\nErrors:');
  for (const error of results.errors) {
    console.log(`  ❌ ${error}`);
  }
}

if (results.warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of results.warnings) {
    console.log(`  ⚠️  ${warning}`);
  }
}

if (results.valid) {
  console.log('\n✅ Skill passed validation! Ready for upload.');
  process.exit(0);
} else {
  console.log('\n❌ Skill failed validation. Please fix errors before uploading.');
  process.exit(1);
}