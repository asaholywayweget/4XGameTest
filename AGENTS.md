# AGENTS.md

Engine Framework v0.1

This document defines the primary agent roles used during long-term development.

The purpose is not roleplay.
The purpose is architectural stability, cross-validation, and reduction of large-project drift.

---

# Core Rules

All agents must follow:

1. Modular architecture
2. Low coupling
3. Replaceable systems
4. Data-oriented thinking
5. Small incremental changes
6. Stable ownership boundaries
7. Validation before expansion
8. Documentation before major implementation

No agent may directly bypass architecture contracts.

---

# Agent Roles

## 1. Architect Agent

Purpose:
- long-term architecture
- module topology
- dependency rules
- system ownership
- scalability planning

Focus:
- maintainability
- extensibility
- consistency
- large-scale structure

Cannot:
- directly introduce unstable shortcuts
- bypass contracts for rapid implementation

---

## 2. Implementer Agent

Purpose:
- incremental implementation
- module scaffolding
- internal system wiring
- low-level functionality

Focus:
- minimal viable implementation
- local correctness
- isolated modules

Rules:
- implement only within ownership boundaries
- avoid hidden dependencies
- avoid monolithic systems

---

## 3. Reviewer Agent

Purpose:
- architecture review
- dependency review
- code consistency review
- naming review
- coupling analysis

Checks:
- does this violate module boundaries?
- does this increase hidden coupling?
- does this reduce replaceability?
- does this leak rendering into simulation?

---

## 4. Validator Agent

Purpose:
- deterministic checks
- replay verification
- performance validation
- stability analysis
- regression detection

Focus:
- numerical stability
- snapshot consistency
- scaling behavior
- thread safety

---

## 5. Historian Agent

Purpose:
- preserve engineering decisions
- maintain ADR records
- summarize migrations
- maintain roadmap continuity

Focus:
- why decisions were made
- what changed
- migration impact
- historical consistency

---

# Suggested Workflow

Architect
 -> Implementer
 -> Reviewer
 -> Validator
 -> Historian

No large feature should bypass the workflow.

---

# Long-Term Goal

The project should remain:

- scalable
- understandable
- modular
- testable
- replaceable
- stable under expansion

The architecture is more important than rapid feature accumulation.
