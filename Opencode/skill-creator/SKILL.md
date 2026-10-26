---
name: skill-creator
description: >-
  Skill creation, optimization, and evaluation expert. Always invoke this
  skill when the user asks about creating new skills, modifying existing skills,
  improving skill performance, running evaluations, benchmarking with variance
  analysis, or optimizing skill descriptions for better triggering accuracy.
metadata:
  related_skills: [prompt-compressor, learning-loop]
---

> Do not create or modify skills directly — use this skill first to follow
> proper workflow: capture intent, interview & research, write SKILL.md with
> effective descriptions, create test prompts, run evals, and iterate based on
> quantitative/qualitative feedback. Covers: progressive disclosure structure,
> metadata requirements, compatibility fields, bundled resources organization,
> and better activation rates through directive descriptions.


---

**LANGUAGE RULE: ALL skills MUST be written in English by default unless user explicitly requests otherwise.**

**Critical: always invoke this skill first** for any skill creation, optimization, evaluation, or benchmarking. Do not write/modify skills directly — this skill ensures better activation rates and proper workflow.

**COMPRESSION:** After drafting SKILL.md, before evals, invoke `prompt-compressor`. P1 rules (L1 always), P2 docs (L2 routine). Verbose first, compress second, re-test each pass. See `references/compression-guide.md`.

A skill for creating new skills and iteratively improving them.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few test prompts and run an agent using the skill on them
- Help the user evaluate the results both qualitatively and quantitatively
  - While the runs happen in the background, draft some quantitative evals if there aren't any (if there are some, you can either use as is or modify if you feel something needs to change about them). Then explain them to the user (or if they already existed, explain the ones that already exist)
  - Use the `eval-viewer/generate_review.py` script to show the user the results for them to look at, and also let them look at the quantitative metrics
- Rewrite the skill based on feedback from the user's evaluation of the results (and also if there are any glaring flaws that become apparent from the quantitative benchmarks)
- Repeat until you're satisfied
- Expand the test set and try again at larger scale

Your job when using this skill is to figure out where the user is in this process and then jump in and help them progress through these stages. So for instance, maybe they're like "I want to make a skill for X". You can help narrow down what they mean, write a draft, write the test cases, figure out how they want to evaluate, run all the prompts, and repeat.

On the other hand, maybe they already have a draft of the skill. In this case you can go straight to the eval/iterate part of the loop.

Of course, you should always be flexible and if the user is like "I don't need to run a bunch of evaluations, just vibe with me", you can do that instead.

Then after the skill is done (but again, the order is flexible), you can also run the skill description improver, which we have a whole separate script for, to optimize the triggering of the skill.

## Communicating with the user

The skill creator is used by people with widely varying technical familiarity — from non-experts opening a terminal for the first time to computer-literate users.

Pay attention to context cues to understand how to phrase your communication! In the default case, just to give you some idea:

- "evaluation" and "benchmark" are borderline, but OK
- for "JSON" and "assertion" you want to see serious cues from the user that they know what those things are before using them without explaining them

It's OK to briefly explain terms if you're in doubt, and feel free to clarify terms with a short definition if you're unsure if the user will get it.

---

## Creating a skill

## Reference files

The agents/ directory contains instructions for specialized subagents. Read them when you need to spawn the relevant subagent.

- `agents/grader.md` — How to evaluate assertions against outputs
- `agents/comparator.md` — How to do blind A/B comparison between two outputs
- `agents/analyzer.md` — How to analyze why one version beat another

The references/ directory has additional documentation:
- `references/schemas.md` — JSON structures for evals.json, grading.json, etc.

---

Repeating one more time the core loop here for emphasis:

- Figure out what the skill is about
- Draft or edit the skill
- Run an agent using the skill on test prompts
- With the user, evaluate the outputs:
  - Create benchmark.json and run `eval-viewer/generate_review.py` to help the user review them
  - Run quantitative evals
- Repeat until you and the user are satisfied
- Package the final skill and return it to the user.

Add steps to the todo list (if one exists) so they don't get dropped; specifically include "Create evals JSON and run `eval-viewer/generate_review.py` so human can review test cases".

## References

Description/trigger conventions come from the `prompt-compressor` skill.

- `references/adapting-existing.md` — porting skills from other tools
- `references/capture-intent.md` — extracting intent from conversation
- `references/claude-specific.md` — Claude.ai workflow adaptations
- `references/compression-guide.md` — when to compress in draft→eval loop
- `references/cowork-specific.md` — Cowork environment adaptations
- `references/prompt-eng.md` — tone-and-language best practices
- `references/schemas.md` — evals.json / grading.json JSON schemas
- `references/step1-spawn.md` — spawning with-skill + baseline runs
- `references/step1-triggers.md` — generating trigger eval queries
- `references/step4-grade.md` — grading runs, launching review viewer
- `references/thinking-improvements.md` — generalizing eval feedback
