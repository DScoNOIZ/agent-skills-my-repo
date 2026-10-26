---
name: prompt-compressor
description: >-
  Universal token-efficiency standard for all agent-facing text. Applies
  intelligent L1-L4 compression (water removal → pseudocode) to skills, memory,
  cron, AGENTS.md, system prompts, subagent context. Preserves meaning.
  Mandatory for all agent-facing text in this environment.
metadata:
  related_skills: [skill-creator, inner-curator, learning-loop]
triggers:
  - creating or editing a skill
  - skill-creator workflow (after draft, before evals)
  - writing memory or canonical memory entry
  - composing subagent (task tool) context
  - user mentions "PCOMP", "skill", "memory", "эффективно", "сжато", "токены"
  - RU text found in agent-facing docs (must convert to EN)
---

# prompt-compressor — Token-Efficient Information Architecture

**This document applies to itself.** Every section uses its own level.

---

## RO — Rules of Engagement

```
P0  SAFETY | rules | commands | schemas | creds | paths → NO touch
P1  CORE   | frameworks | decisions → L1 max, full clarity
P2  REF    | docs | context | examples → L2
P3  VERBOSE| explanations | prose blocks → L3
P4  BOILER | decor | water | redundancy → L4/symbol logic

ALL agent text → compress per P-level. User output → NEVER compress.
LANG  DEFAULT → EN (skills, memory, cron, sysprompt, code, comments)
      user output → user's language (RU for this user)
      explicit user request → honour it
      ENFORCEMENT: Agent-facing artifacts (skills, references, prompts, delegate context,
        code comments, cron prompts, technical docs) contain ZERO user-language text.
        NO mixing. NO quotes in user language. NO user-language in code comments.
        User-language text in agent-facing docs = BUG — convert immediately.
        User explicitly corrected this (2026-07-15): agent-facing text must be pure EN.
        Exception: trigger/keyword patterns the agent must match from user input.
        See references/language-enforcement.md
Refs: references/language-enforcement.md (canonical rules) | propagation-deep-dive.md (worked examples) | pre-flight-checklist.md (pre-write gate).
DELEGATE  ANY file edit | ANY code | ≥3 tool calls → decompose via `task`
           subagents (explore = fast search, general = multi-step work)
           Run independent subagents in parallel; TodoWrite-tracked.
           While subagents run → continue with non-overlapping work.
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

**Skill-creator integration:** `skill-creator` drafts verbose → invoke here before evals → compress per P-level → return for testing. Canonical for L1-L4; `compression-guide.md` there delegates here.

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
| Memory entry | ≤80 | 2200 char pool shared |
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

<!-- COMPRESS: L2 applied below -->

## L1 TIDY — water removal

**Strip these (no info loss):**
`please|basically|essentially|simply|just|note that|it is important|you should|you can|you need to|in order to|in other words|kind of|sort of|actually|really|literally|of course|as you know`

**Remove decorative separators:** `────`, `════`, `••••`, `----` repeated >3×. Model parses blank lines, not visual dividers.

**Normalize tone:**
```
❌ NEVER do X! You are STRICTLY FORBIDDEN from Y!
✅ Don't do X.
```
Research 2025-26: aggressive tone → lower compliance on modern models. Calm direct > CAPS.

---

## L2 MERGE — deduplication

**Across blocks:**
```
a.md: "DO NOT continue back and forth"
b.md: "NOT engage in back and forth"
→ Keep in 1 place, remove duplicate.
```

**Collapse lists:**
```
- clipboard: list, peek, search, get, save, delete, pin, unpin, pull
→ clipboard tools: list|peek|search|get|save|delete|pin|unpin|pull
```

**Merge adjacent same-topic rules:**
```
- MCP: one at a time.
- MCP: wait for confirmation.
→ MCP: one at a time, confirm before next.
```

---

## L3 COMPRESS — structural

**Prose → schema:**
```
Apply pipeline: replace → prepend → wrap_with("{content}") → append.
No {content}? Content appended to template.
→ Transforms (ordered): replace→prepend→wrap_with({content})→append.
  Absent {content} placeholder? Content appended to template.
```

**Bullets → table/chain:**
```
- chat(-1/-2)→msgs|focus/sel/anchor/ctx
- file(path)→disk|+startLine/endLine
- terminal(cmd)→cmd|sel/anchor/ctx
```

**Drop redundant headers when context is obvious:**
```
### Focus-Driven AST Auto-Expansion
  focus keyword → AST expands to full syntactic block
→ focus → AST expands to full syntactic block
```

**Inline error lists:**
```
Error: resolution fails → fallback. Force close → wait.
→ Failure→fallback. Force close→wait.
```

---

## L4 MINIMAL — extreme

**Priority-weighted per-line compression:**
```
HIGHEST ← full words, untouched
## ORDER    override all     ← critical
## SKILL    if match→load    ← mild compress
## USER     new→cancel       ← moderate, symbols
## LOOP     ≥2err|stall→Ctx7 ← heavy symbols
```

**Pseudocode + social compression:**
```
## EDIT     only:patch (scoped)
           no:exec|write|sed|awk|perl|echo|printf|cat|heredoc
           fail:+all context +:start:/:end:→retry
```
Key: `:value`, `val1|val2`, `≥threshold`, `→action`, `;else`

**Scope-tagged abbreviations:**
```markdown
<!-- SCOPE_START -->
<!-- Terms below apply ONLY within this block -->
<!-- ref=ContentReference, src=source, sel=selector, ctx=contextType -->
<!-- SCOPE_END -->
ref reuses session ctx — saves ~80% tokens.
ref OVERRIDES prim. {} resolves in ALL string params.
Sources: chat(-1/-2)→msgs, file(path)→disk, terminal→cmd.
<!-- SCOPE_END -->
```
Opening AND closing tags mandatory. Without close → model may leak abbrevs into later context.

**Drop articles (a/an/the), pronouns (it/they), link verbs (is/are):**
```
The ref parameter OVERRIDES the content parameter when present.
→ ref OVERRIDES content param when present.
```

**Symbol chains for short mappings:**
```
chat→focus/sel/anchor/ctx
file→+startLine/endLine
tool→TRS(O(1))→history
```

---

## Decompression (when over-compressed)

**Symptoms:** agent misunderstands, misses nuance, ignores edge cases.

**Recovery:**
1. Identify over-compressed block (←SCOPE tags help)
2. Expand abbreviations → full words
3. Decompress symbol chains → prose if model misreads
4. Test on target model
5. L4 failed → fall back to L3 for that block

Safe to experiment: decompression path exists.

---

## Verification & Iteration

1. Read compressed version. Identify every claim/nuance.
2. Cross-check vs original. Any loss?
3. Loss found → restore block, compress differently.
4. Read standalone — does it flow logically?
5. LLM-targeted? Test on target model: "Understand all nuances?"
6. Pass → done. Fail → decompress that block.

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| Code / JSON / schemas | **NO compress** — syntax matters |
| Critical safety | Compress prose, keep warnings verbatim |
| Examples w/ specific values | Keep values, compress framing |
| Blocks <100 tok | L1 only, no abbreviations |
| User's existing jargon | Preserve, don't redefine |
| **Mixed-lang content in agent docs** | **BUG — convert; see ENFORCEMENT above** |
| User-facing output with embedded code | User language for framing, EN for code blocks |
