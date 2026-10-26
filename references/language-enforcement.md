# Language Enforcement — Agent-Facing Artifacts

User correction (2026-07-15): All agent-facing documentation (skills, references,
prompts, system prompts, delegate context, cron prompts, comments) MUST be in
English ONLY. User-language text in these artifacts is a bug.

## Root Rule

```
Agent-facing artifacts: EN ONLY — skills, references, templates, scripts,
  prompts, system prompts, delegate context, memory entries, cron prompts,
  code comments, commit messages, technical docs.
User-facing output: user's language (RU for this user).
```

## What This Means

- SKILL.md body → EN (descriptions, steps, tables, code blocks)
- Reference files → EN (examples, API docs, error transcripts, explanations)
- Delegate_task context → EN (instructions, file paths, commands)
- Cron prompts → EN (goals, instructions)
- Memory entries → EN (facts, observations)
- System prompt → EN (rules, directives)
- Code comments → EN
- **User-facing text IN contexts** (e.g. error messages shown to user) → user's language

## What This Forbids

| ❌ Wrong | ✅ Right |
|----------|----------|
| `Rule: Loop внутри пары` | `Rule: Loop within pair` |
| `Signal: User "всё в одну каску"` | `Signal: User frustration with solo work` |
| `NEVER "см. выше"` | `NEVER "see above"` |
| `context="""ПОЛНЫЙ КОНТЕКСТ:"""` | `context="""FULL CONTEXT:"""` |
| `# Настройки` (comment in skill) | `# Settings` |

## Exceptions (rare, justified)

1. **Trigger/keyword patterns** — actual Russian phrases the agent must recognize
   from user input (e.g. `"суперперфекционизм"`, `"в одну каску"`). These are
   *match patterns*, not prose. Keep them in original language.
2. **Direct quotes from user** — if the user said something in Russian that the
   agent needs to reference verbatim in a context. Wrap as quote, not prose body.
3. **Locale/language configuration values** — `LANG: ru`, `language: ru`. These
   are config, not prose.

## Enforcement Check

Before saving any agent-facing file:
1. Scan for Cyrillic, Chinese, Arabic, etc. in prose sections (not code blocks).
2. If found → is it a trigger pattern, verbatim quote, or config value?
3. No → translate to English. This is a bugfix, not optional cleanup.
