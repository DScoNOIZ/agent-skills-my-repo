# 🧠 Agent Skills Repository

**🇷🇺 Репозиторий скиллов для AI-агентов**  
Сборник готовых скиллов для OpenCode, ZooCode и совместимых агентов.  
Каждый скилл — самодостаточный модуль с документацией, скриптами и референсами.

---

**🇬🇧 AI Agent Skills Repository**  
Collection of ready-to-use skills for OpenCode, ZooCode, and compatible agents.  
Each skill is a self-contained module with documentation, scripts, and references.

---

### 📁 Структура / Structure

```
agent-skills-my-repo/
├── Opencode/           # Скиллы для OpenCode
│   ├── prompt-compressor/    # Токен-сжатие агентских контекстов
│   └── skill-creator/        # Создание и оптимизация скиллов
└── ZooCode/            # Скиллы для ZooCode
    └── RooCode-Skills/       # Скиллы из RooCode
        └── custom-tool-creator/  # Создание кастомных инструментов
```

---

### 🎯 Доступные скиллы / Available Skills

#### Opencode

| Скилл / Skill | Описание / Description |
|---------------|------------------------|
| **prompt-compressor** | Универсальный стандарт токен-эффективности для агентских текстов. L1–L4 сжатие, enforcement EN-only, верификация. |
| **skill-creator** | Эксперт по созданию, оптимизации и оценке скиллов. Полный цикл: intent → draft → evals → iterate → package. |

#### ZooCode

| Скилл / Skill | Описание / Description |
|---------------|------------------------|
| **RooCode-Skills/custom-tool-creator** | Комплексное руководство по созданию кастомных инструментов для Roo-агентов (CommonJS, ES Modules, TypeScript). |

---

### 🚀 Установка / Installation

```bash
# Клонировать репозиторий
git clone https://github.com/DScoNOIZ/agent-skills-my-repo.git ~/.config/opencode/skills

# Или симлинк нужных скиллов
ln -s ~/path/to/agent-skills-my-repo/Opencode/prompt-compressor ~/.config/opencode/skills/
ln -s ~/path/to/agent-skills-my-repo/Opencode/skill-creator ~/.config/opencode/skills/
```

---

### 📖 Использование / Usage

Скилл загружается автоматически при совпадении триггеров или вручную:
```
> skill prompt-compressor
> skill skill-creator
```

---

### ⚠️ Важное предупреждение / Important Disclaimer

**🇷🇺**  
Все скиллы в этом репозитории **генерируются и редактируются AI-агентами в реальном времени**.  
Человек-автор **не может гарантировать** их правильность, полноту, безопасность или пригодность для какого-либо назначения.  
**Использование на свой страх и риск.** Автор **не несет никакой ответственности** за любые последствия использования этих скиллов — включая, но не ограничиваясь: потерю данных, нарушение безопасности, финансовые убытки, поломку оборудования или любые иные ущербы.  
**Обязательно проверяйте и тестируйте каждый скилл перед использованием в продакшене.**

**🇬🇧**  
All skills in this repository are **generated and edited by AI agents in real time**.  
The human author **cannot guarantee** their correctness, completeness, safety, or fitness for any purpose.  
**Use at your own risk.** The author **bears no responsibility** for any consequences of using these skills — including but not limited to: data loss, security breaches, financial loss, equipment damage, or any other harm.  
**You must verify and test every skill before using it in production.**

---

### 📄 Лицензия / License

**CC0** — Public Domain. Используйте свободно / Use freely.

---

*Maintained by DScoNOIZ. Primary language: Russian/English.*
