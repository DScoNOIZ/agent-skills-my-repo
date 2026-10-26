# 🛠️ Custom Tool Creator Skill

[English](#english) | [Русский](#русский)

---

## ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** This entire repository was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy. Content may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

<strong>📌 This repository is for personal collection only and is made public for convenience.</strong> I simply make it open because it's more convenient for me. Potential danger and inaccuracies are present — beware!

**Русский:** Весь этот репозиторий создан ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность. Контент может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

<strong>📌 Этот репозиторий чисто для моей коллекции и просто я его сделал открытым чтобы мне было удобнее.</strong> Я делаю его открытым просто потому что мне так удобнее. Возможная опасность и неточности присутствуют — остерегайся!

---

## English

### Purpose

The **Custom Tool Creator** skill provides comprehensive guidance for building custom tools for Roo agents. It covers all supported formats: CommonJS, ES Modules (ESM), and TypeScript, with complete templates, best practices, and security guidelines.

### Key Features

- Complete project structure with 15 documentation fragments
- 20 practical example scripts (files, system, API, UI, database)
- Templates for CommonJS, ESM, and TypeScript
- Parameter validation and schema definitions
- Security best practices and error handling patterns
- JavaScript validator script (`scripts/validate-skill.js`)
- Bilingual documentation (EN/RU)

### Quick Start

1. **Read the fragments** in `/fragments/` sequentially:
   - `01-basics.md` → `15-resources.md`
   - Each fragment covers a specific aspect of custom tool development

2. **Study the examples** in `/assets/`:
   - `commonjs.js` — CommonJS template
   - `typescript.ts` — TypeScript template
   - `examples/` — 20 working scripts organized by category

3. **Create your own tool**:
   - Copy a template from `/assets/`
   - Update `name`, `description`, `parameters`
   - Implement logic in `async execute({ params })`
   - Deploy via Roo in `.roo/skills/your-skill/SKILL.md`

4. **Validate** before deployment:
   ```bash
   node /RooCode-Skills/custom-tool-creator/scripts/validate-skill.js
   ```

### Project Structure

```
custom-tool-creator/
├── SKILL.md                    # Skill metadata and configuration
├── README.md                   # This file
├── fragments/                  # 15 documentation fragments
│   ├── 01-basics.md
│   ├── 02-formats.md
│   ├── ...
│   └── 15-resources.md
├── assets/                     # Templates and examples
│   ├── commonjs.js
│   ├── typescript.ts
│   ├── examples/
│   │   ├── files/
│   │   ├── system/
│   │   ├── api/
│   │   ├── transformation/
│   │   └── ui/
│   ├── package.json.template
│   └── .env.example
└── scripts/
    └── validate-skill.js      # Validation utility
```

### SKILL.md Format

Key fields in `SKILL.md`:

- `id`, `name`, `description` — unique identifier and bilingual descriptions
- `purpose`, `scope` — what the tool does and its boundaries
- `agent_roles`, `modes` — compatibility with agents and modes
- `parameters` — input schema (JSON Schema format)
- `settings`, `variables` — configuration and state variables
- `examples` — usage examples
- `dependencies` — external requirements

### Security Guidelines

- **Always validate inputs** using JSON Schema `parameters`
- **Never execute arbitrary code** without sandboxing
- **Handle errors gracefully** — don't expose internal errors to users
- **Store secrets** in `.env` or secret manager, never in code
- **Review all generated code** before deployment

### Resources

- [Roo Code Documentation](https://docs.roocode.com/)
- [Custom Tools Guide](https://docs.roocode.com/features/experimental/custom-tools/)
- [JSON Schema Specification](https://json-schema.org/)
- `FORMAT_SPEC.md` in this repository

---

## Русский

### Назначение

Скилл **Custom Tool Creator** представляет собой полное руководство по созданию кастомных инструментов для агентов Roo. Освещает все поддерживаемые форматы: CommonJS, ES Modules и TypeScript, с полными шаблонами, лучшими практиками и руководствами по безопасности.

### Ключевые возможности

- Полная структура проекта с 15 фрагментами документации
- 20 практических примеров скриптов (файлы, система, API, UI, базы данных)
- Шаблоны для CommonJS, ESM и TypeScript
- Валидация параметров и определения схем
- Рекомендации по безопасности и паттерны обработки ошибок
- JavaScript-валидатор (`scripts/validate-skill.js`)
- Двуязычная документация (RU/EN)

### Быстрый старт

1. **Изучите фрагменты** в `/fragments/` по порядку:
   - `01-basics.md` → `15-resources.md`
   - Каждый фрагмент раскрывает определённый аспект разработки инструментов

2. **Изучите примеры** в `/assets/`:
   - `commonjs.js` — шаблон CommonJS
   - `typescript.ts` — шаблон TypeScript
   - `examples/` — 20 рабочих скриптов по категориям

3. **Создайте свой инструмент**:
   - Скопируйте шаблон из `/assets/`
   - Обновите `name`, `description`, `parameters`
   - Реализуйте логику в `async execute({ params })`
   - Разверните через Roo в `.roo/skills/your-skill/SKILL.md`

4. **Валидируйте** перед развёртыванием:
   ```bash
   node /RooCode-Skills/custom-tool-creator/scripts/validate-skill.js
   ```

### Структура проекта

```
custom-tool-creator/
├── SKILL.md                    # Метаданные скилла и конфигурация
├── README.md                   # Этот файл
├── fragments/                  # 15 фрагментов документации
│   ├── 01-basics.md
│   ├── 02-formats.md
│   ├── ...
│   └── 15-resources.md
├── assets/                     # Шаблоны и примеры
│   ├── commonjs.js
│   ├── typescript.ts
│   ├── examples/
│   │   ├── files/
│   │   ├── system/
│   │   ├── api/
│   │   ├── transformation/
│   │   └── ui/
│   ├── package.json.template
│   └── .env.example
└── scripts/
    └── validate-skill.js      # Утилита валидации
```

### Формат SKILL.md

Ключевые поля в `SKILL.md`:

- `id`, `name`, `description` — уникальный идентификатор и описания на двух языках
- `purpose`, `scope` — что делает инструмент и его границы ответственности
- `agent_roles`, `modes` — совместимость с агентами и модами
- `parameters` — схема входных данных (формат JSON Schema)
- `settings`, `variables` — конфигурация и переменные состояния
- `examples` — примеры использования
- `dependencies` — внешние зависимости

### Безопасность

- **Всегда валидируйте входные данные** через JSON Schema `parameters`
- **Никогда не выполняйте произвольный код** без sandbox
- **Обрабатывайте ошибки корректно** — не exposed внутренних ошибок пользователю
- **Храните секреты** только в `.env` или менеджере секретов
- **Проверяйте весь сгенерированный код** перед использованием

### Ресурсы

- [Документация Roo Code](https://docs.roocode.com/)
- [Руководство по Custom Tools](https://docs.roocode.com/features/experimental/custom-tools/)
- [Спецификация JSON Schema](https://json-schema.org/)
- `FORMAT_SPEC.md` в этом репозитории

---

**⚠️ Напоминание:** Весь контент создан ИИ. Проверяйте всё перед использованием. Никакой ответственности не принимается.