# Prompt Eng

> Extracted from `skill-creator` SKILL.md during P1.2 split (2026-08-05).

---

### Prompt Engineering Best Practices for Skills

Based on 2025-2026 research and empirical testing:

**Tone & Language:**
- Avoid aggressive language: "CRITICAL!", "YOU MUST", "NEVER EVER" — these overtrigger modern models (Claude 4+, GPT-5+) and reduce compliance
- Use calm, direct instructions: "Do X" instead of "You MUST do X"
- Explain the *why* behind instructions — models with good theory of mind outperform rote rule-following

**Compression Strategies:**
- For long blocks (>50 lines): use semantic compression — remove water words ("please", "basically", "essentially"), merge repeated phrases, use compact formulations
- For very long blocks (>100 lines): consider a scoped abbreviation system at the top, but ONLY if the block is long enough to justify the overhead (abbreviations cost ~50 tokens to define, so they only save net tokens on blocks >200 tokens)
- Use progressive disclosure: metadata → SKILL.md → bundled resources (scripts/references/assets)

**Structure Patterns:**
- Lead with the most important instructions (models pay more attention to beginning and end)
- Use numbered steps for sequential workflows
- Use tables for reference data, not prose
- Keep SKILL.md under 500 lines; split into references/ if approaching the limit

**What NOT to do:**
- Don't stack contradictory constraints ("be concise" + "provide detailed explanations")
- Don't over-constrain creative tasks — 10-15 constraints max for generative skills
- Don't use vague qualifiers ("be professional") — be specific ("use complete sentences, no slang")

**Empirical Finding:** Abbreviation systems (defining shorthand at the start of a block) only provide net token savings on blocks longer than ~200 tokens. For shorter blocks, the definition overhead exceeds the savings.

### Test Cases

After writing the skill draft, come up with 2-3 realistic test prompts — the kind of thing a real user would actually say. Share them with the user: [you don't have to use this exact language] "Here are a few test cases I'd like to try. Do these look right, or do you want to add more?" Then run them.

Save test cases to `evals/evals.json`. Don't write assertions yet — just the prompts. You'll draft assertions in the next step while the runs are in progress.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

See `references/schemas.md` for the full schema (including the `assertions` field, which you'll add later).

## Running and evaluating test cases

This section is one continuous sequence — don't stop partway through. Do NOT use `/skill-test` or any other testing skill.

Put results in `<skill-name>-workspace/` as a sibling to the skill directory. Within the workspace, organize results by iteration (`iteration-1/`, `iteration-2/`, etc.) and within that, each test case gets a directory (`eval-0/`, `eval-1/`, etc.). Don't create all of this upfront — just create directories as you go.