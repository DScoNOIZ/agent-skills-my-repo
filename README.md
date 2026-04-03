# 🚀 Roo Skills Repository

[English](#english) | [Русский](#русский)

---

## ⚠️ BIOHAZARD WARNING - AI-GENERATED CONTENT ⚠️

**English:** This entire repository was created by AI (Step-3.5-Flash). The repository owner admits **complete ignorance of code** and cannot verify accuracy, safety, or legitimacy. Content may contain errors, vulnerabilities, or malicious code (unintentional). **Use entirely at your own risk. No responsibility is assumed.** All reviewers and users must independently verify everything before use!

<strong>📌 This repository is for personal collection only and is made public for convenience.</strong> I simply make it open because it's more convenient for me. Potential danger and inaccuracies are present — beware!

**Русский:** Весь этот репозиторий создан ИИ (Step-3.5-Flash). Владелец репозитория признаёт **полную неграмотность в коде** и не может гарантировать точность, безопасность или легитимность. Контент может содержать ошибки, уязвимости или вредоносный код (непреднамеренно). **Используйте исключительно на свой страх и риск. Никакой ответственности не берётся.** Все проверяющие и пользователи обязаны самостоятельно всё проверить перед использованием!

<strong>📌 Этот репозиторий чисто для моей коллекции и просто я его сделал открытым чтобы мне было удобнее.</strong> Я делаю его открытым просто потому что мне так удобнее. Возможная опасность и неточности присутствуют — остерегайся!

---

## English

### About

This repository hosts custom skills for [Roo Code](https://roocode.com) Your AI Software Engineering Team is here.
Interactive in the IDE, autonomous in the cloud. Each skill extends Roo's capabilities with custom tools, integrations, and workflows.

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

- **Live Site**: https://github.com/DScoNOIZ/agent-skills-my-repo
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

### Инструменты разработки

- `scripts/validate-skill.js` - Локальная валидация структуры навыка
  ```bash
  node scripts/validate-skill.js skills/my-skill
  ```

### Ресурсы

- [Документация Roo Code](https://roocode.com/docs)
- [Руководство по Custom Tools](https://roocode.com/docs/skills/custom-tools)
- [Спецификация JSON Schema](https://json-schema.org/)
