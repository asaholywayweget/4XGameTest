# Review Checklist

Version: v0.1

Use this checklist before accepting a change.

---

# Architecture

- Does the change fit the module ownership model?
- Does it introduce a forbidden dependency?
- Does it keep simulation independent from rendering?
- Does it preserve replaceability?
- Is the abstraction necessary and not premature?

---

# Implementation

- Is the change small?
- Is the responsibility local?
- Are names clear?
- Is state ownership explicit?
- Can this be tested independently?

---

# Validation

- Is there a test or invariant?
- Can the failure be reproduced?
- Is the result deterministic?
- Are numerical tolerances documented?
- Does snapshot or replay behavior remain stable?

---

# Performance

- Does the change allocate unexpectedly?
- Does it block simulation with IO or rendering?
- Does it scale with chunks, entities, or threads?
- Is the cost visible to profiling later?

---

# Documentation

- Does the module contract need updating?
- Does the architecture contract still match reality?
- Is an ADR needed?
- Does this affect the roadmap?
