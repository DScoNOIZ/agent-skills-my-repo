#!/usr/bin/env node

/**
 * test_tools_interactively.js — интерактивный тест-раннер для Custom Tools
 *
 * Позволяет быстро протестировать инструмент, передавая параметры через stdin.
 *
 * Usage:
 *   node test_tools_interactively.js <path-to-tool.js>
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadTool(filePath) {
  try {
    // Очищаем кэш чтобы загрузить свежую версию
    delete require.cache[require.resolve(path.resolve(filePath))];

    const toolModule = require(filePath);

    // Находим все инструменты в модуле
    const tools = [];

    // Если module.exports directamente工具
    if (toolModule.name && toolModule.execute) {
      tools.push(toolModule);
    } else {
      // Ищем все properties которые являются инструментами
      Object.values(toolModule).forEach(value => {
        if (value && typeof value === 'object' && value.name && value.execute) {
          tools.push(value);
        }
      });
    }

    return tools;
  } catch (error) {
    log(`Failed to load tool: ${error.message}`, 'red');
    process.exit(1);
  }
}

function printSchema(schema) {
  if (!schema) {
    log('No parameters defined', 'yellow');
    return;
  }

  const { type, properties, required = [] } = schema;

  if (type !== 'object') {
    log('Parameters must be an object type', 'yellow');
    return;
  }

  log('Parameters:', 'cyan');
  Object.entries(properties).forEach(([key, prop]) => {
    const isRequired = required.includes(key);
    const typeStr = prop.type || 'any';
    const desc = prop.description ? ` — ${prop.description}` : '';
    const defaultStr = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
    const reqStr = isRequired ? colors.red(' (required)') : colors.green(' (optional)');
    console.log(`  ${key}${reqStr}: ${typeStr}${desc}${defaultStr}`);
  });
}

async function runInteractive(tool) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Tool: ${tool.name}`, 'bold');
  log(`Description: ${tool.description}`, 'yellow');
  log(`${'='.repeat(60)}`, 'cyan');

  while (true) {
    console.log('');
    printSchema(tool.parameters);
    console.log('');

    // Prompt для ввода
    process.stdout.write('Enter params (JSON) or "quit" to exit: ');
    const input = await new Promise(resolve => {
      process.stdin.once('data', data => resolve(data.toString().trim()));
    });

    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      log('Exiting...', 'yellow');
      process.exit(0);
    }

    if (!input) {
      continue;
    }

    let params;
    try {
      params = JSON.parse(input);
    } catch (e) {
      log(`Invalid JSON: ${e.message}`, 'red');
      continue;
    }

    // Выполняем инструмент
    log('\nExecuting...', 'cyan');
    const startTime = Date.now();

    try {
      const result = await tool.execute(params);
      const duration = Date.now() - startTime;

      log(`\n✓ Success (${duration}ms)`, 'green');
      console.log('Result:');

      // Beautify output если объект
      if (typeof result === 'object' && result !== null) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(String(result));
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      log(`\n✗ Error after ${duration}ms`, 'red');
      console.log(`Message: ${error.message || error}`);

      if (error.stack) {
        log('\nStack trace:', 'red');
        console.log(error.stack);
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    log('Usage: node test_tools_interactively.js <path-to-tool.js>', 'yellow');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'red');
    process.exit(1);
  }

  const tools = loadTool(filePath);

  if (tools.length === 0) {
    log('No tools found in file. Ensure module.exports.toolName = {...}', 'red');
    process.exit(1);
  }

  if (tools.length > 1) {
    log(`Found ${tools.length} tools in file: ${tools.map(t => t.name).join(', ')}`, 'cyan');
    log('Which tool do you want to test?', 'yellow');

    tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} — ${tool.description}`);
    });

    process.stdout.write('Enter number (or "all" for sequential test): ');
    const choice = require('readline-sync').question('', {
      hideEchoBack: false
    }).trim();

    let selectedTool;
    if (choice.toLowerCase() === 'all') {
      // Test all sequentially
      tools.forEach((tool, index) => {
        log(`\n\n--- Testing ${index + 1}/${tools.length}: ${tool.name} ---`, 'bold');
        runInteractive(tool).catch(console.error);
      });
      return;
    }

    const num = parseInt(choice, 10) - 1;
    if (isNaN(num) || num < 0 || num >= tools.length) {
      log('Invalid selection', 'red');
      process.exit(1);
    }

    selectedTool = tools[num];
  } else {
    const selectedTool = tools[0];
  }

  // Запускаем интерактивный режим
  runInteractive(tools[0]).catch(console.error);
}

// Для простоты используем readline-sync если доступен, иначе fallback to async stdin
try {
  require('readline-sync');
} catch (e) {
  log('Note: For better UX, install readline-sync: npm install -g readline-sync', 'yellow');
  // Fallback implementation using builtin readline
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // Переопределяем process.stdin.once для совместимости
  process.stdin.once = function(event, callback) {
    if (event === 'data') {
      rl.question('', answer => callback(Buffer.from(answer + '\n')));
    }
  };
}

main();