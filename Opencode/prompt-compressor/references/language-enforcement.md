# Language Enforcement — Agent-Facing Artifacts

## Root Rule (tied to OWNER CONSTANTS)

```
Agent-facing artifacts → AGENT_FACING_LANGUAGE (en)
User-facing output     → USER_LANGUAGE (ru for current owner)
```

See OWNER CONSTANTS block in SKILL.md. Those values are the source of truth for this installation.

## What This Means

- SKILL.md body, references, templates, scripts, prompts, system prompts, delegate context, memory entries, cron prompts, code comments, commit messages, technical docs → AGENT_FACING_LANGUAGE only.
- Replies, explanations, error messages shown to the user → USER_LANGUAGE.

## What This Forbids

| ❌ Wrong | ✅ Right |
|----------|----------|
| User-language prose inside SKILL.md | AGENT_FACING_LANGUAGE only |
| Mixing languages in agent-facing docs | Pure AGENT_FACING_LANGUAGE |
| Leaving another owner's language constants | Rewrite OWNER CONSTANTS first |

## Exceptions (rare)

1. Trigger/keyword patterns the agent must match from user input (keep original language).
2. Direct verbatim quotes from the user (wrap as quote).
3. Locale/config values (`LANG: xx`).

## Enforcement Check

Before saving any agent-facing file:
1. Scan for non-AGENT_FACING_LANGUAGE prose outside code blocks and allowed exceptions.
2. If found and not an exception → convert. This is a bug fix.

## When the skill is used by someone else

If this skill is downloaded by a different user or agent:
- The OWNER CONSTANTS must be rewritten to that user's language and preferences before any other work.
- Do not keep the previous owner's USER_LANGUAGE or other personal constants.