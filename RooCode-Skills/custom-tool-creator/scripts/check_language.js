#!/usr/bin/env node

/**
 * check_language.js — определяет основной язык markdown файлов
 *
 * Простой эвристический анализ:
 * - Считает кириллические vs латинские слова
 * - Выводит % кириллицы
 * - Классифицирует как 'ru' (>30% кириллицы), 'en' (<10%), 'mixed'
 */

const fs = require('fs');
const path = require('path');

function detectLanguage(text) {
  // Убираем код, ссылки, special chars
  const clean = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[0-9\p{P}\s]/gu, ' '); // punctuation + whitespace

  const words = clean.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 'unknown';

  const cyrillic = words.filter(w => /[\p{Script=Cyrillic}]/u.test(w)).length;
  const latin = words.filter(w => /[a-zA-Z]/u.test(w) && !/[\p{Script=Cyrillic}]/u.test(w)).length;

  const percentCyrillic = (cyrillic / words.length) * 100;
  const percentLatin = (latin / words.length) * 100;

  return {
    totalWords: words.length,
    cyrillic,
    latin,
    percentCyrillic: percentCyrillic.toFixed(1),
    percentLatin: percentLatin.toFixed(1),
    lang: percentCyrillic > 30 ? 'ru' : percentLatin > 50 ? 'en' : 'mixed/unknown'
  };
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = detectLanguage(content);
  return stats;
}

function walkDir(dir, ext = '.md') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Main
const skillDir = process.argv[2] || './.roo/skills/custom-tool-creator';
const files = walkDir(skillDir);

console.log(`\nLanguage Analysis for: ${skillDir}\n`);
console.log('File'.padEnd(60), 'Lang'.padEnd(10), 'Cyr%'.padEnd(8), 'Lat%'.padEnd(8), 'Words');
console.log('-'.repeat(120));

let summary = { ru: 0, en: 0, mixed: 0, unknown: 0 };

files.forEach(file => {
  const relPath = path.relative(skillDir, file);
  try {
    const stats = analyzeFile(file);
    summary[stats.lang] = (summary[stats.lang] || 0) + 1;
    console.log(
      relPath.padEnd(60),
      stats.lang.padEnd(10),
      stats.percentCyrillic.padEnd(8),
      stats.percentLatin.padEnd(8),
      stats.totalWords
    );
  } catch (e) {
    console.log(relPath.padEnd(60), 'ERROR', e.message);
  }
});

console.log('\nSummary:', summary);
console.log('\nRecommendation: All descriptive content (SKILL.md, fragments, scripts/README.md, references/) should be English.');