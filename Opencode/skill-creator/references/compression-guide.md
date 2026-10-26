# Compression Techniques Reference

> Canonical source: `prompt-compressor` skill (L1-L4 levels, P0-P4 engagement, verification loop). This guide is workflow integration for `skill-creator` — when to compress in the draft → compress → eval loop, not a replacement. Invoke `prompt-compressor` after draft, before evals.

## Core Principles (2025-2026 Research)

### 1. Semantic Compression (self-discovered)
Remove water words without losing meaning:
- "please", "basically", "essentially", "it is important to", "you should"
- "simply provide a single" → just "use"
- "automatically find the word and expand" → "AST expands"
- "saving 80-96% of tokens on long fragments and ensuring consistency" → "saves ~80% tokens"

**Rule of thumb:** Every sentence can lose ~30% words without losing information.

### 2. Structure Compression (self-discovered)
Replace prose with compact formats:
- Tables: "focus, selector, startAnchor, endAnchor, contextType" instead of bullet list
- Arrows: "->" instead of "then" or "followed by"
- Inline: "chat("-1"/"-2") -> assistant msgs -> focus/sel/anchor/ctx"
- Priority chains: "focus(AST) -> startLine+endLine -> startAnchor"

### 3. Scoped Abbreviation System (user's idea)
Define shorthand at block start, scoped ONLY to that block:

```
<!-- ABBREV_START -->
<!-- CRT = Content Reference -->
<!-- src = source type -->
<!-- sel = selector method -->
<!-- ABBREV_END -->
```

**Empirical finding (tested in this chat):**
- Abbreviation overhead: ~50 tokens (7-8 definitions)
- Breakeven point: ~200 token block
- Below 200 tokens: abbreviations INCREASE size
- Above 200 tokens: net savings proportional to repetition frequency
- Best for: long blocks with repeated technical terms (CRT, ref, multi_ref)

### 4. Aggressive Language Anti-Pattern (self-discovered, validated by research)
Modern models (Claude 4+, GPT-5+) **overtrigger** on aggressive language:
- "CRITICAL!", "YOU MUST", "NEVER EVER" → reduces compliance
- Research from Anthropic API docs (2026), Thomas Wiegold, Lakera AI
- Fix: calm, direct instructions work better

**Before:** "You are STRICTLY FORBIDDEN from starting your messages with Great"
**After:** "Do not start messages with Great, Certainly, Okay, Sure"

**Before:** "NEVER end attempt_completion result with a question!"
**After:** "Never end attempt_completion with a question - the result must be final."

### 5. Progressive Disclosure (existing skill pattern, validated)
Three-level loading:
1. Metadata (name + description) — always in context (~100 words)
2. SKILL.md body — loaded on trigger (<500 lines)
3. Bundled resources — loaded on demand (scripts, references, assets)

### 6. Compression Mode Spectrum (existing skill pattern)

| Mode | Lines | Savings | Best For |
|------|-------|---------|----------|
| HARDCORE | 15-20 | ~85% | Simple workflows, weak models |
| SMART | 30-40 | ~65% | Balanced skills (DEFAULT) |
| COMPACT | ~40 | ~60% | Moderate token budget |
| VERBOSE | 80-100 | 0% | Complex skills, onboarding |

### 7. Compression Workflow (refined during chat)

1. **Write verbose first** — get all nuances right
2. **Test and verify** — run evals, confirm correctness
3. **Compress iteratively** — apply techniques one by one:
   - Remove water words → saves ~30%
   - Use compact structure → saves another ~20%
   - Consider abbreviations ONLY if block >200 tokens
4. **Re-test after each compression pass** — verify no nuance lost
5. **Never compress:**
   - Examples (critical for model learning)
   - Edge cases with detailed explanations
   - Error messages (clarity > brevity)

### 8. Token Math (tested in this chat)

| Block | Original | Compressed | Savings |
|-------|----------|------------|---------|
| CRT (62 lines) | 964 tokens | 512 tokens (with abbrev) | -47% |
| CRT (62 lines) | 964 tokens | 392 tokens (without abbrev) | -59% |
| objective.ts | ~550 tokens | ~350 tokens | -36% |
| capabilities.ts | ~600 tokens | ~420 tokens | -30% |
| rules.ts | ~1,500 tokens | ~1,100 tokens | -27% |

**Key insight:** Abbreviations add overhead. On a 62-line block, the no-abbreviation version was actually 120 tokens SMALLER than the abbreviation version. Abbreviations only pay off on much larger blocks.

### 9. When NOT to Compress

- Critical orchestration rules (attempt_completion behavior)
- Security constraints
- Error handling instructions
- Examples (models learn better from examples than rules)
- Complex multi-step workflows

### 10. Recommended Workflow

1. Default to SMART compression mode
2. For simple skills: HARDCORE
3. For complex skills: VERBOSE first, then invoke `prompt-compressor` (P1 rules, P2 docs), then selectively compress
4. Measure token counts with `python3 -c "print(len(open('SKILL.md').read())//4)"`
5. Only add abbreviations if block >500 tokens AND has high term repetition
6. Re-test after each compression pass — evals run on compressed version, not verbose draft
