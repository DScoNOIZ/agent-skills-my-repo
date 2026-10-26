# Capture Intent

> Extracted from `skill-creator` SKILL.md during P1.2 split (2026-08-05).

---

### Capture Intent

Start by understanding the user's intent. The current conversation might already contain a workflow the user wants to capture (e.g., they say "turn this into a skill"). If so, extract answers from the conversation history first — the tools used, the sequence of steps, corrections the user made, input/output formats observed. The user may need to fill the gaps, and should confirm before proceeding to the next step.

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases to verify the skill works? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from test cases. Skills with subjective outputs (writing style, art) often don't need them. Suggest the appropriate default based on the skill type, but let the user decide.
5. **LANGUAGE:** Default to English unless user explicitly requests otherwise. SKILL.md content should be in English regardless of conversation language.

6. **COMPRESSION MODE:** Ask user before writing. Options:
   
   **A) HARDCORE** (~15-20 lines, 85% token savings)
   - Pseudocode style: `RUN cmd`, `IF cond → RUN cmd`
   - No prose, one-liners only
   - Symbol table for commands
   - Best for: weak models, token-limited contexts, simple workflows
   
   **B) SMART** (~30-40 lines, 60-70% savings)
   - Hybrid: compress WHERE needed, keep verbose WHERE needed
   - Compress: descriptions, triggers, errors, quick-ref
   - Keep verbose: complex steps, edge cases, examples
   - Best for: balanced skills
   
   **C) COMPACT** (~40 lines, 60% savings)
   - All one-liners, no prose
   - Numbered steps, vertical stacks
   - Triggers > 5 variants
   - Best for: moderate token budget
   
   **D) VERBOSE** (~80-100 lines, full documentation)
   - Bullet lists, tables, inline examples
   - Full explanations
   - Best for: complex skills, onboarding, detailed workflows
   
   **Default:** SMART unless user specifies otherwise.
   
   **ASK:** "Which compression mode? (A) Hardcore / (B) Smart / (C) Compact / (D) Verbose"

**Abbreviation Systems (for long blocks >200 tokens):**
- Define shorthand at the start: `<!-- ABBREV: ref=Content Reference, src=source, sel=selector -->`
- Use abbreviations only within the defined block scope
- Empirical finding: abbreviations only provide net savings on blocks >200 tokens (definition overhead ~50 tokens)
- Best for: CRT-like blocks, repeated technical terms, long reference sections
- Don't use for: short blocks, one-off terms, blocks <100 tokens

### Interview and Research

Proactively ask questions about edge cases, input/output formats, example files, success criteria, and dependencies. Wait to write test prompts until you've got this part ironed out.

Check available MCPs - if useful for research (searching docs, finding similar skills, looking up best practices), research in parallel via subagents if available, otherwise inline. Come prepared with context to reduce burden on the user.

### Write the SKILL.md

Based on the user interview, fill in these components:

- **name**: Skill identifier
- **description**: When to trigger, what it does. This is the primary triggering mechanism - include both what the skill does AND specific contexts for when to use it. All "when to use" info goes here, not in the body. Note: currently Claude has a tendency to "undertrigger" skills -- to not use them when they'd be useful. To combat this, please make the skill descriptions a little bit "pushy". So for instance, instead of "How to build a simple fast dashboard to display internal Anthropic data.", you might write "How to build a simple fast dashboard to display internal Anthropic data. Make sure to use this skill whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data, even if they don't explicitly ask for a 'dashboard.'"
- **compatibility**: Required tools, dependencies (optional, rarely needed)
- **the rest of the skill :)**

#### Compact Mode Writing Guide (when user chooses C)

If user selected Compact mode, apply these optimizations:

| Element | Avoid | Use Instead |
|---------|-------|-------------|
| Structure | `# Title with emoji` | `# title` |
| Lists | `- bullet item` | `1. numbered item` |
| Tables | `\| col \| col \|` | `KEY: value` |
| Prose | Full sentences | One-liners |
| Code | Inline without fences | `\`code\`` |
| Description | Multi-sentence | 1 line, <100 chars |
| Triggers | 2-3 variants | 8+ variants |
| Examples | Inline paragraphs | `EXAMPLES: see ./examples.md` |
| Errors | Bullets | `ERR: message → fix` |

**Template for Compact SKILL.md:**
```markdown
---
name: skill-name
description: Does X for Y. Triggers: keyword1, keyword2, keyword3
---

# skill name

**TRIGGER:** keyword|keyword|keyword + context
**ALWAYS RUN:** below

## DONT
- scenario1
- scenario2

## STEPS
1. step one
2. step two

## VERIFY
`command` # expected output

## FIX
`command` # recovery

## ERRORS
- error1: `fix`
- error2: `fix`
```

**Key rules for compact:**
- No articles (a, an, the)
- No pronouns (it, they, you)
- No prose paragraphs
- Commands in backticks
- Sections: DONT, STEPS (or OPTION 1/2), VERIFY, FIX, ERRORS
- Triggers > 8 variants for better matching
- Description <100 chars

#### Hardcore Mode Writing Guide (when user chooses A)

For maximum compression (~15-20 lines, 85% savings), use pseudocode syntax:

**Pseudocode commands:**
- `RUN <cmd>` — execute command
- `IF <cond>` / `ELIF <cond>` / `ELSE` — conditional
- `→` — maps to (error→fix)
- `#` — comment
- `&` — chain commands (cmd1 & cmd2)

**Hardcore SKILL.md template:**
```markdown
---
name:x
desc:x
triggers:x,x,x,x,x
---

#RUN
IF WANT=x → RUN cmd1 & cmd2
IF WANT=y → RUN cmd3

#DO
1.RUN cmd1 && cmd2

#VERIFY
RUN cmd  #→expected

#FIX
RUN fix

#ERR
x→fix
y→fix
```

**Hardcore rules:**
- Description <50 chars
- Triggers ≥8 variants
- Commands chained with `&` or `&&`
- No spaces in one-liners: `1.RUN cmd`
- Comments inline: `#→output`
- Errors as `err→fix`

#### Smart Mode Writing Guide (when user chooses B)

Hybrid approach — compress WHERE needed, keep verbose WHERE needed:

**Compress these sections:**
- YAML frontmatter: <80 chars total
- Triggers: 10+ variants
- Description: 1 line, <100 chars
- ERRORS: inline →fix format
- QUICK REF: vertical stack

**Keep verbose these sections:**
- Complex multi-step workflows
- Edge cases with detailed explanations
- Examples with context
- Troubleshooting with multiple causes

**Smart template:**
```markdown
---
name:x
desc:Does X. Triggers:kw1,kw2,kw3,kw4,kw5,kw6,kw7,kw8
---

# SKILL

## DONT
- scenario1

## OPTION 1: NEW
1. RUN cmd1
2. RUN cmd2 && cmd3

## OPTION 2: EXISTING
Detailed steps here (keep verbose for complex ops)
...

## VERIFY
`cmd` # output

## ERRORS
err1→fix
err2→fix

## EXAMPLE
Keep detailed example here (complex context needs full explanation)
```

#### Verbose Mode Writing Guide (when user chooses D)

Full documentation style for complex skills:

**Keep these elements:**
- Full bullet lists with explanations
- Tables for reference data
- Inline examples with context
- Detailed troubleshooting sections
- All edge cases documented

**Template:** Standard SKILL.md structure with prose explanations.

---

### Skill Writing Guide

#### Anatomy of a Skill

```
skill-name/
 SKILL.md (required)
    YAML frontmatter (name, description required)
    Markdown instructions
 Bundled Resources (optional)
     scripts/    - Executable code for deterministic/repetitive tasks
     references/ - Docs loaded into context as needed
     assets/     - Files used in output (templates, icons, fonts)
```

#### Progressive Disclosure

Skills use a three-level loading system:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill triggers (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited, scripts can execute without loading)

These word counts are approximate and you can feel free to go longer if needed.

**Key patterns:**
- Keep SKILL.md under 500 lines; if you're approaching this limit, add an additional layer of hierarchy along with clear pointers about where the model using the skill should go next to follow up.
- Reference files clearly from SKILL.md with guidance on when to read them
- For large reference files (>300 lines), include a table of contents

**Domain organization**: When a skill supports multiple domains/frameworks, organize by variant:
```
cloud-deploy/
 SKILL.md (workflow + selection)
 references/
     aws.md
     gcp.md
     azure.md
```
Claude reads only the relevant reference file.

#### Principle of Lack of Surprise

This goes without saying, but skills must not contain malware, exploit code, or any content that could compromise system security. A skill's contents should not surprise the user in their intent if described. Don't go along with requests to create misleading skills or skills designed to facilitate unauthorized access, data exfiltration, or other malicious activities. Things like a "roleplay as an XYZ" are OK though.

#### Writing Patterns

Prefer using the imperative form in instructions.

**Defining output formats** - You can do it like this:
```markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples pattern** - It's useful to include examples. You can format them like this (but if "Input" and "Output" are in the examples you might want to deviate a little):
```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

### Writing Style

Try to explain to the model why things are important in lieu of heavy-handed musty MUSTs. Use theory of mind and try to make the skill general and not super-narrow to specific examples. Start by writing a draft and then look at it with fresh eyes and improve it.