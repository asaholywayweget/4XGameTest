# Self-Correction Protocol

Version: v0.1

This protocol is used when validation fails, implementation becomes unstable, or architectural drift is detected.

The system must not immediately patch symptoms.
It must first inspect the issue through multiple agent roles defined in AGENTS.md.

---

# Trigger Conditions

Use this protocol when:

- tests fail
- replay diverges
- snapshots become inconsistent
- module boundaries are unclear
- implementation starts leaking responsibilities
- performance collapses unexpectedly
- numerical instability appears
- a quick fix would break long-term structure

---

# Required Review Passes

## 1. Architect Pass

Questions:

- Did the implementation violate the architecture contract?
- Is the module boundary wrong?
- Is this feature placed in the correct layer?
- Does the dependency direction remain valid?
- Is the fix compatible with long-term expansion?

Output:
- architecture diagnosis
- allowed module location
- forbidden shortcut list

---

## 2. Reviewer Pass

Questions:

- Is coupling increasing?
- Are hidden dependencies appearing?
- Are names and responsibilities still clear?
- Is simulation logic leaking into rendering or UI?
- Is state ownership ambiguous?

Output:
- boundary violations
- coupling risks
- naming or responsibility corrections

---

## 3. Validator Pass

Questions:

- What exact invariant failed?
- Is the failure deterministic?
- Can it be reproduced from a snapshot or test?
- Does the failure come from math, state, time, threading, or IO?
- What minimal test should be added?

Output:
- failed invariant
- reproduction path
- proposed test

---

## 4. Implementer Pass

Questions:

- What is the smallest safe patch?
- Which module owns the change?
- Can this be fixed without widening scope?
- Does the patch need a new interface or only an implementation change?

Output:
- minimal patch plan
- affected files
- test update list

---

## 5. Historian Pass

Questions:

- Is this a design decision?
- Does this require an ADR?
- Does the roadmap need adjustment?
- Is this a known limitation or a bug?

Output:
- decision record note
- migration note if needed

---

# Rule

If validation fails, do not skip directly to implementation.
Run at least:

1. Reviewer Pass
2. Validator Pass
3. Implementer Pass

For architecture-sensitive failures, also run Architect Pass.

---

# Standard Failure Report Format

```txt
Failure:

Observed:

Expected:

Affected Module:

Agent Review:
- Architect:
- Reviewer:
- Validator:
- Implementer:
- Historian:

Decision:

Patch Scope:

Tests Added:
```
