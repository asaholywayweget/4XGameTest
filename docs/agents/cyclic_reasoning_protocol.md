# Cyclic Reasoning Protocol

This document defines the unattended-safe cyclic reasoning protocol for the Simulation-first Engine Framework.

The loop has two output packets:

1. `Text Packet` — explanation, architecture, review, contract reasoning.
2. `Code Packet` — executable project artifacts, tests, scripts, and runtime-facing implementation proposals.

The loop must always complete the Text Packet gate before entering the Code Packet gate.

---

## Core Loop

```txt
Read Project State
    ↓
Run Four Domain Agents
    ↓
Run Role Gap Arbiter
    ↓
If missing responsibility exists:
    Add / refine agent responsibility
    Re-run review
Else:
    Enter Dual Packet Output
        ├─ Text Packet
        └─ Code Packet
    ↓
Validation Review
    ↓
Next Loop Seed
```

---

## Agent Set

### 1. Coordinator / Arbiter

Owns:
- Loop routing
- Conflict detection
- Stability decision
- Packet gating
- Final merge recommendation

Must ask:
- Is any responsibility missing?
- Did any agent claim another domain's authority?
- Is this safe for unattended progress?

### 2. Core Architecture Agent

Owns:
- ECS / data-oriented model
- Scheduler / tick phase
- Module boundary
- Streaming policy
- Simulation ABI

### 3. Spatial / Coordinate Agent

Owns:
- Universe partitioning
- Precision zones
- Origin shifting
- Chunk / tile addressing
- Coordinate transform authority

### 4. Physics / Rendering Agent

Owns:
- GPU representation
- Debug visualization
- SDF / shader / compute prototypes
- Runtime representation consumers

Restriction:
- Must not define global coordinate authority.

### 5. RTS / Entity Simulation Agent

Owns:
- Army / squad / unit model
- ORBAT hierarchy
- Macro / micro simulation grids
- Pathfinding and flow-field planning
- Large-scale entity lifecycle

Restriction:
- Must not define EntityId, tick semantics, or global event envelope.

### 6. Role Gap Arbiter

Owns:
- Detecting missing responsibilities
- Proposing new agents only when a responsibility is persistent and cross-cutting
- Preventing unnecessary agent proliferation
- Re-running the structure review after adding or refining an agent

The Role Gap Arbiter is not a domain agent. It is a review function under Coordinator authority.

---

## Agent Addition Rule

A new agent may be proposed only if all conditions are true:

1. The responsibility is cross-cutting or deep enough to overload an existing agent.
2. At least two loops identify the same unresolved responsibility.
3. The responsibility has stable input/output boundaries.
4. The responsibility cannot be represented as a shared contract module.
5. Coordinator records the reason in a role review document.

Otherwise, the responsibility must become either:

- a shared contract module, or
- a sub-responsibility under an existing agent.

---

## Current Potential Missing Agents

These are candidates only, not active domain agents:

### Validation / Verification Agent

Candidate if validation scenarios become large enough to require ownership.

Likely owns:
- deterministic replay scenarios
- contract conformance tests
- regression scenario taxonomy
- failure classification

### Tooling / Build Agent

Candidate if project develops real build and codegen pipelines.

Likely owns:
- build scripts
- code generation tools
- CI safety checks
- local runner ergonomics

### Data / Asset Compilation Agent

Candidate if Simulation Asset Compilation becomes concrete.

Likely owns:
- source asset schema
- material compilation
- runtime proxy compilation
- data validation

Default decision for now:

```txt
Do not add these as active agents yet.
Represent them as shared modules and review candidates.
```

---

## Dual Packet Contract

### Text Packet

Contains:
- Architectural explanation
- Responsibility changes
- Contract proposals
- Risks and open questions
- Next task breakdown

Must not contain:
- Large code blocks intended as final implementation
- Hidden behavior changes
- Runtime mutations

### Code Packet

Contains:
- Executable files
- Test files
- Scripts
- Minimal implementation skeletons
- Machine-checkable JSON/YAML if needed

Must not contain:
- Long prose explanations
- Architecture debates
- Unreviewed destructive changes

---

## Gate Between Text and Code

The Code Packet can be produced only when:

1. Role Gap Arbiter reports no blocking missing responsibility.
2. Coordinator marks the scope Green or explicitly Yellow-with-branch.
3. The target path is isolated from core runtime or guarded by tests.
4. The Code Packet is small enough to review.
5. The expected behavior can be executed or inspected independently.

---

## Branch Policy

Unattended or semi-attended code work must use a branch:

```txt
agent-loop-*
```

Main branch direct writes are reserved for:
- documentation-only updates, or
- explicit user-approved changes.

---

## Stop Conditions

Stop before Code Packet if:

1. A new stable contract must be invented.
2. Entity identity changes.
3. Tick semantics change.
4. Coordinate authority changes.
5. Existing runtime code must be rewritten.
6. Build, dependency, or CI behavior must be changed.

---

## Loop Output Template

```txt
[Loop ID]

[Text Packet]
- Summary
- Agent outputs
- Role gap review
- Shared contract changes
- Risks

[Code Packet]
- Changed files
- How to run
- Expected result
- Validation status

[Next Loop Seed]
- Next safe target
- Blockers
- Human review needed
```
