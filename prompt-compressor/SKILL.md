---
name: prompt-compressor
description: Universal token-efficiency standard for all agent-facing text. Applies intelligent L1-L4 compression (water removal to pseudocode) to skills, memory, cron, AGENTS.md, system prompts, subagent context. Preserves meaning. Mandatory for all agent-facing text in this environment.
metadata:
  related_skills: [skill-creator, microcean]
---

# prompt-compressor — Token-Efficient Information Architecture

**This document applies to itself.** Every section uses its own level.

---

## OWNER CONSTANTS (current environment)

These values are **constants for the current owner/operator** of this skill copy.
They are stored here deliberately and must be treated as fixed for this installation.

```
USER_LANGUAGE          = ru          # user-facing replies, explanations, error messages
AGENT_FACING_LANGUAGE  = en          # skills, memory, prompts, code comments, technical docs
PRIMARY_PROJECT_LANG   = ru          # Microcean content currently developed in Russian-first mode
DATE_FORMAT            = YYYY-MM-DD
OWNER_TIMEZONE         = Europe/Moscow (approx)
```

**RULE FOR OTHER USERS / OTHER AGENTS:**
If you download or copy this skill into a different environment or for a different user —
you **MUST** adapt all OWNER CONSTANTS above to the new user before use.
Do not leave another person's language or preferences. Rewrite the constants block first.

---

## RO — Rules of Engagement

```
P0  SAFETY | rules | commands | schemas | creds | paths → NO touch
P1  CORE   | frameworks | decisions → L1 max, full clarity
P2  REF    | docs | context | examples → L2
P3  VERBOSE| explanations | prose blocks → L3
P4  BOILER | decor | water | redundancy → L4/symbol logic

ALL agent text → compress per P-level. User output → NEVER compress.

LANG  DEFAULT → AGENT_FACING_LANGUAGE (EN)
      user-facing output → USER_LANGUAGE (ru for this owner)
      explicit user request → honour it
      ENFORCEMENT: Agent-facing artifacts contain ZERO user-language text.
        NO mixing. NO user-language in code comments.
        User-language text in agent-facing docs = BUG — convert immediately.
        Exception: trigger/keyword patterns the agent must match from user input.
        See references/language-enforcement.md

DELEGATE  ANY file edit | ANY code | ≥3 tool calls → decompose via task
           subagents (explore = fast search, general = multi-step work)
           Run independent subagents in parallel.
           BEFORE action: check resource existence (pip list|which|docker images|ls).
```

<!-- COMPRESS: P1 -->

## Decision Framework

**Step 1 — Classify artifact:**
| Type | Default P | Notes |
|------|-----------|-------|
| Safety instructions, credentials | **P0** | Zero changes |
| AGENTS.md, SKILL.md rules | **P1** | Compress prose, keep rules verbatim |
| Memory entries | **P2** | Compact, no water |
| Subagent (task) context | **P3** | ~200 tok, dense key info |
| Skill descriptions, doc strings | **P2** | 30-50 tok, clear |
| User output | **P0** | Do NOT compress |

**Step 2 — Map sections.** Within a doc, assign P per logical block (not whole doc).

**Step 3 — Iterative apply:** compress block → verify vs original → loss? restore+reapproach. See Verification.

**Skill-creator integration:** `skill-creator` drafts verbose → invoke here before evals → compress per P-level → return for testing.

---

<!-- COMPRESS: P0 -->

## Never-Compress

- Safety / jailbreak prevention rules
- Exact shell commands (1 char off → fail)
- JSON schemas / YAML / Regex / Globs
- SSH keys, tokens, secrets
- File paths (compress framing, not path)
- User's verbatim instructions
- Command flags (`--flag`, `-f value`)

---

<!-- COMPRESS: P2 -->

## Token Budget (target per artifact)

| Artifact | Max tok | Rationale |
|----------|---------|-----------|
| Memory entry | ≤80 | Shared pool |
| Skill description | ≤30 | Frontmatter field |
| Subagent context | ≤200 | Per subagent |
| AGENTS.md section | ≤100 | Loaded into prompt |
| SKILL.md rule block | ≤50 | Per standalone rule |

Above target → compress. Fit within budget → done.

---

<!-- COMPRESS: P2 -->

## Levels Overview

| Lvl | Style | ~Save | When |
|-----|-------|-------|------|
| L1 TIDY | Strip water, normalize tone | 10-20% | Safe always, any doc |
| L2 MERGE | Dedup, collapse lists | 20-35% | Routine blocks |
| L3 COMPRESS | Restructure, compact schemas | 35-55% | Large blocks, P3 |
| L4 MINIMAL | Pseudocode, symbols | 55-80% | P4, token-scarce |

---

## L1 TIDY — water removal

**Strip these (no info loss):**
`please|basically|essentially|simply|just|note that|it is important|you should|you can|you need to|in order to|in other words|kind of|sort of|actually|really|literally|of course|as you know`

**Remove decorative separators:** repeated `────` `════` `••••` `----` >3×.

**Normalize tone:**
```
❌ NEVER do X! You are STRICTLY FORBIDDEN from Y!
✅ Don't do X.
```
Calm direct > CAPS. Aggressive tone lowers compliance on modern models.

---

## L2 MERGE — deduplication

Keep one copy of repeated rules. Collapse lists into `|`-chains. Merge adjacent same-topic rules.

---

## L3 COMPRESS — structural

Prose → schema / ordered transforms. Bullets → table or symbol chain. Drop redundant headers. Inline error lists.

---

## L4 MINIMAL — extreme

Priority-weighted lines. Pseudocode + symbols (`:value`, `val1|val2`, `≥N`, `→action`). Scope-tagged abbreviations (open + close tags mandatory). Drop articles/pronouns/link verbs where safe.

---

## Decompression

Symptoms: agent misunderstands, misses nuance, ignores edge cases.  
Recovery: expand abbreviations → full words, decompress symbol chains, fall back L4→L3 for the bad block. Test on target model.

---

## Verification & Iteration

1. Read compressed version → list every claim/nuance.
2. Cross-check vs original. Loss? → restore + re-compress differently.
3. Standalone flow check.
4. Target-model test if possible.
5. Pass → done.

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| Code / JSON / schemas | **NO compress** |
| Critical safety | Compress prose, keep warnings verbatim |
| Examples w/ specific values | Keep values, compress framing |
| Blocks <100 tok | L1 only |
| User's existing jargon | Preserve |
| Mixed-lang in agent docs | **BUG — convert to AGENT_FACING_LANGUAGE** |
| User-facing + embedded code | USER_LANGUAGE for framing, EN for code |

---

## Adaptation rule (mandatory)

OWNER CONSTANTS block at the top is authoritative for **this** installation.

If the skill is copied, forked, or used by a different user/agent/environment:
1. Rewrite the OWNER CONSTANTS block to match the new user.
2. Do not leave previous owner's language or preferences.
3. All other rules stay the same.
