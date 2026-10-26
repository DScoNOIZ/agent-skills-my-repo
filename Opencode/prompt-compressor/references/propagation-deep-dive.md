# Propagation Deep-Dive — Why SOUL.md Doesn't Reach Children

## The Problem

When you call `delegate_task`, the child agent does NOT receive:
- SOUL.md identity (`load_soul_identity=False` default)
- Project context files (`skip_context_files=True`)
- Memory (`skip_memory=True`)

This means any rules, directives, or identity you embed in SOUL.md are invisible to sub-agents unless explicitly passed via `context=`.

## The Code Paths (Hermes Agent v2026)

### 1. Child agent creation (`tools/delegate_tool.py:1300-1360`)

```python
child = AIAgent(
    ...
    skip_context_files=True,        # line 1338 — hardcoded
    skip_memory=True,               # line 1339 — hardcoded
    ephemeral_system_prompt=child_prompt,  # line 1335 — only source of rules
    ...
)
```

`load_soul_identity` is NOT passed, so it defaults to `False` (from `run_agent.py:479`, `agent/agent_init.py:337`).

### 2. System prompt assembly (`agent/system_prompt.py:187-191`)

```python
if agent.load_soul_identity or not agent.skip_context_files:
    _soul_content = _r.load_soul_md(_ctx_len)
```

For a child: `False or not True` = **False** → SOUL.md is skipped entirely.

### 3. Child system prompt content (`tools/delegate_tool.py:661-736`)

`_build_child_system_prompt()` builds a minimal prompt:
- Generic identity: "You are a focused subagent..."
- The `goal` text
- The `context` text (if provided)
- Workspace path hint
- Summary format instructions
- For orchestrators: delegation capability notes

No SOUL.md, no AGENTS.md, no memory, no skills.

## The Fix (workaround without modifying core)

The ONLY way to propagate rules to children is via the `context=` parameter of `delegate_task`:

```python
delegate_task(
    goal="...",
    context="""Jarvis ASI rules — INHERIT and pass down:

## USER DIRECTIVES [P0 — NEVER COMPRESS]
## ORDER    override all
## SKILL    if match → load before respond
## USER     new input → cancel current task
## EDIT     only:patch (hermes); no terminal write_file sed awk perl echo printf cat heredoc; fail: +all file context +:start_line:/:end_line:→retry
## MCP      primary; Context7:query docs|search|≥2fail→fallback
## LANG     ru; tech/code en ok
## LOOP     ≥2err|2-3 stalled→search docs; else continue
## MODE     Orchestrate (≥5steps|≥7files|refactor|e2e|mig); never: suboptimal workaround
## DEBUG    Context7+Tavily per error; search→read→fix
## TZ       UTC

## RESOURCE CONSTITUTION
- Before ANY install: check (pip list|which|docker images|ls ~/PROGRAMMS/)
- Reuse caches, venvs, builds. Never rebuild from zero.
- Minimal footprint: lightest tool that solves the task.
- Clean up temp files immediately.

## DECOMPOSITION MANDATE
>5 steps → delegate or orchestrate. Never grind 15+ calls.

## LANGUAGE
RU user-facing, EN tech/code.
"""
)
```

This block is SELF-CONTAINED — the child receives everything it needs without accessing SOUL.md. **Children MUST pass the same block to THEIR children** — the chain must not break.

## Verification

To verify rules reached a child, check the child's output for compliance:
- Did it check `pip list` before installing? (Resource Constitution)
- Did it decompose >5 steps? (Decomposition Mandate)
- Did it pass the same block to its own children? (Propagation Rule)

If any of these fail, the propagation chain broke — fix the parent's `context=` call.

## Context Budget

- delegate context is budgeted at ~200 tokens (P3 in prompt-compressor)
- The User Directives block alone is ~400 tokens
- **Solution:** Apply L4 compression to ALL non-P0 sections of the block (Resource Constitution → symbol chains, Decomposition → one-liner). Only User Directives remain P0 (full words).