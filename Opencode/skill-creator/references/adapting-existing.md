# Adapting Existing

> Extracted from `skill-creator` SKILL.md during P1.2 split (2026-08-05).

---

### Adapting Existing Skills from Other Tools (Roo Code, Claude Code, Cursor)

When the user asks you to port a skill from another AI tool (e.g., `.roo/skills/`, `CLAUDE.md`, `.cursorrules`), follow this strict protocol:

**ALWAYS** copy the original file first, then apply minimal patches. Never rewrite from scratch.

```
cp /path/to/original/SKILL.md /path/to/hermes/skills/<category>/<name>/SKILL.md
```

**Allowed changes ONLY:**
1. **Frontmatter** — adapt name/description to Hermes format. Keep original description wording as close as possible — only change platform-specific mechanics.
2. **Mode/reference changes** — replace mode-switching (Roo's `switch_mode`, `execute_command`) with Hermes' `terminal tool`. Keep ALL other wording, rules, workflow structure, examples, and trigger patterns intact.
3. **Paths** — update script paths from `~/.roo/...` or `~/.claude/...` to `~/.hermes/skills/<category>/<name>/scripts/...`.

**Forbidden changes:**
- Do NOT rewrite the skill body, workflow, or rules in your own words
- Do NOT add your own formulations, preamble, or commentary
- Do NOT change trigger patterns
- Do NOT remove original examples
- Do NOT embed manual fallback logic if the original forbids it

**Pitfall:** Users who created their skills in another tool are attached to the original wording. A rewrite — even if semantically equivalent — will be rejected because it loses the exact phrasing, priority order, and edge-case handling they validated. The cp + patch approach preserves their investment and trust.

**Pitfall:** Roo Code skills often have mode-switching logic (`switch_mode to "code" mode`, `execute_command`). For Hermes, the terminal tool is always available — collapse these into a single "run via terminal tool" step. Keep the priority numbering and error handling intact.

**Pitfall:** Always copy the script/executable files too — they're part of the skill contract. A skill that references a missing script is broken.