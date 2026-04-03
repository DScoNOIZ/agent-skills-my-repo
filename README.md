# 🚀 Roo Skills Repository

[English](#english) | [Русский](#русский)

---

## ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** Everything in this repository was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy of any content. Code may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

**Русский:** Всё в этом репозитории создано ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность любого контента. Код может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

---

## English

### About

This repository hosts custom skills for [Roo Code](https://roocode.com) AI assistant. Each skill extends Roo's capabilities with custom tools, integrations, and workflows.

### Structure

```
skills/
├── <skill-id>/
│   ├── SKILL.md              # Skill metadata (required)
│   ├── tool.js | tool.ts     # Implementation (required)
│   ├── package.json         # Dependencies (optional)
│   ├── references/          # Documentation fragments
│   ├── assets/              # Icons, templates, examples
│   └── scripts/             # Helper utilities
├── <another-skill>/
│   └── ...
index.html                    # Main gallery page (GitHub Pages)
skills/<skill-id>/index.html # Individual skill pages
```

### Adding a New Skill

1. Create a new directory under `skills/` with a unique skill ID
2. Add `SKILL.md` with YAML frontmatter (see [FORMAT_SPEC.md](FORMAT_SPEC.md))
3. Create the tool implementation (`tool.js`, `tool.ts`, or `tool.py`)
4. Add optional supporting files (assets, references, examples)
5. Update `index.html` to add your skill to the gallery
6. Create `skills/<skill-id>/index.html` for the skill's detail page
7. Submit a pull request or push directly to main

### Skill Metadata Format

See [FORMAT_SPEC.md](FORMAT_SPEC.md) for complete specification. Basic example:

```yaml
---
name: "My Skill"
id: "my-skill"
version: "1.0.0"
icon: "🔧"
description: "Description for Roo"
author: "Your Name"
permissions:
  - Network
implementation:
  file: "tool.js"
  language: "javascript"
parameters:
  schema:
    type: object
    properties:
      # ...
---
```

### GitHub Pages

This repository is configured for GitHub Pages. The site is published automatically when changes are pushed to the `main` branch.

- **Live Site**: `https://<username>.github.io/agent-skills-my-repo/`
- **Source**: `/index.html` (root) and `/skills/*/index.html`

To update the site, edit the HTML files and push to `main`.

### Development Tools

- `scripts/validate-skill.js` - Validate skill structure locally
  ```bash
  node scripts/validate-skill.js skills/my-skill
  ```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add your skill following the format spec
4. Ensure validation passes
5. Submit a pull request with:
   - Skill files in `skills/<skill-id>/`
   - Updates to `index.html` (main gallery)
   - Updates to `skills/<skill-id>/index.html` (skill page)

### Resources

- [Roo Code Documentation](https://roocode.com/docs)
- [Custom Tools Guide](https://roocode.com/docs/skills/custom-tools)
- [JSON Schema Specification](https://json-schema.org/)

### License

Each skill can have its own license. By contributing, you agree to license your skill under terms compatible with Roo Code's ecosystem.

---

## Русский

### О репозитории

Этот репозиторий содержит пользовательские навыки (skills) для AI-ассистента [Roo Code](https://roocode.com). Каждый навык расширяет возможности Roo с помощью кастомных инструментов, интеграций и рабочих процессов.

### Структура

```
skills/
├── <skill-id>/
│   ├── SKILL.md              # Метаданные навыка (обязательно)
│   ├── tool.js | tool.ts     # Реализация (обязательно)
│   ├── package.json         # Зависимости (опционально)
│   ├── references/          # Фрагменты документации
│   ├── assets/              # Иконки, шаблоны, примеры
│   └── scripts/             # Вспомогательные скрипты
├── <другой-навык>/
│   └── ...
index.html                    # Главная страница галереи (GitHub Pages)
skills/<skill-id>/index.html # Страницы отдельных навыков
```

### Добавление нового навыка

1. Создайте директорию под `skills/` с уникальным ID навыка
2. Добавьте `SKILL.md` с YAML frontmatter (см. [FORMAT_SPEC.md](FORMAT_SPEC.md))
3. Создайте реализацию инструмента (`tool.js`, `tool.ts` или `tool.py`)
4. Добавьте опциональные поддерживающие файлы (assets, references, examples)
5. Обновите `index.html` чтобы добавить навык в галерею
6. Создайте `skills/<skill-id>/index.html` для страницы навыка
7. Отправьте pull request или сделайте push напрямую в main

### Формат метаданных навыка

Полную спецификацию см. в [FORMAT_SPEC.md](FORMAT_SPEC.md). Базовый пример:

```yaml
---
name: "Мой Навык"
id: "my-skill"
version: "1.0.0"
icon: "🔧"
description: "Описание для Roo"
author: "Ваше Имя"
permissions:
  - Network
implementation:
  file: "tool.js"
  language: "javascript"
parameters:
  schema:
    type: object
    properties:
      # ...
---
```

### GitHub Pages

Этот репозиторий настроен для GitHub Pages. Сайт публикуется автоматически при пуше в ветку `main`.

- **Сайт**: `https://<username>.github.io/agent-skills-my-repo/`
- **Исходники**: `/index.html` (корень) и `/skills/*/index.html`

### Инструменты разработки

- `scripts/validate-skill.js` - Локальная валидация структуры навыка
  ```bash
  node scripts/validate-skill.js skills/my-skill
  ```

### Вклад в проект

1. Сделайте fork репозитория
2. Создайте ветку feature
3. Добавьте навык, следуя спецификации

4. Убедитесь, что валидация проходит
5. Отправьте pull request с:
   - Файлами навыка в `skills/<skill-id>/`
   - Обновлениями `index.html` (главная галерея)
   - Обновлениями `skills/<skill-id>/index.html` (страница навыка)

### Ресурсы

- [Документация Roo Code](https://roocode.com/docs)
- [Руководство по Custom Tools](https://roocode.com/docs/skills/custom-tools)
- [Спецификация JSON Schema](https://json-schema.org/)
