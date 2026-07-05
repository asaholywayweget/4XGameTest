# Safe Agent Loop Protocol

This document defines the safe cyclic reasoning protocol for the Simulation-first Engine Framework.

The goal is to keep project reasoning active without allowing unattended work to damage architecture, runtime semantics, or repository integrity.

## Loop Goal

Use available reasoning capacity to continuously improve:

- Project state clarity
- Module boundaries
- Shared contracts
- Validation scenarios
- Risk reports
- Next-task dispatch packets

Do not use unattended loops to produce large implementation changes.

## Loop Topology

```txt
Coordinator / Arbiter
    ↓ dispatch
Core Architecture Agent
Spatial / Coordinate Agent
Physics / Rendering Agent
RTS / Entity Simulation Agent
    ↓ reports
Coordinator / Arbiter
    ↓ conflict check
ProjectState / Shared Contracts
    ↓ next loop
```

## Loop Phases

### Phase 0 — Read State

Inputs:
- `README.md`
- `docs/project_state.md`
- Existing shared contract documents
- Existing validation documents

Output:
- Current known state
- Missing documents
- Unsafe areas

### Phase 1 — Dispatch

Coordinator creates one small task packet per relevant domain.

Each packet must contain:

```txt
[Target Agent]
[Task]
[Input Contract]
[Expected Output]
[Forbidden Changes]
[Conflict Check]
[Stability Criteria]
```

### Phase 2 — Domain Reasoning

Each domain agent may produce:

- Design notes
- Contract proposals
- Validation scenario proposals
- Risk notes
- Dependency notes

Each domain agent must not produce:

- Broad rewrites
- Runtime implementation replacing existing architecture
- Source code changes without explicit approval
- Changes outside its ownership boundary

### Phase 3 — Arbiter Merge

Coordinator checks:

1. Does the proposal conflict with `project_state.md`?
2. Does it redefine another domain's authority?
3. Does it introduce unstable naming?
4. Does it affect deterministic runtime semantics?
5. Does it require human approval?

### Phase 4 — Stable Output

Allowed stable outputs:

- New docs under `docs/`
- Contract skeletons
- Validation skeletons
- Decision records
- Issue/task breakdowns

### Phase 5 — Next Loop Planning

Every loop ends with:

```txt
[Completed]
[Changed Files]
[New Stable Decisions]
[Open Risks]
[Next Safe Tasks]
[Blocked Until Human Review]
```

## Default Unattended Mode

When the user is not actively supervising, use this mode:

```txt
Mode: Safe Documentation + Validation Planning
Allowed: Green tasks only
Disallowed: Yellow and Red tasks
Commit target: docs only
Maximum scope: one concept per file
```

## Escalation Rules

Escalate to human review if the loop attempts to modify:

- `/src`
- `/tests` executable behavior
- Build scripts
- CI configuration
- Dependency manifests
- Serialization formats
- Coordinate precision rules
- Tick phase semantics
- Entity identity layout

## Safe Work Queue

The loop may continue producing the following items:

1. `docs/specification/coordinate_contract.md`
2. `docs/runtime/simulation_clock.md`
3. `docs/runtime/entity_id_contract.md`
4. `docs/runtime/tick_phase.md`
5. `docs/runtime/command_event_envelope.md`
6. `docs/validation/validation_scenarios.md`
7. `docs/agents/dispatch_template.md`
8. `docs/agents/conflict_checklist.md`
9. `docs/adr/` decision records

## Stop Conditions

The loop must stop or request review when:

1. A task requires source code modification.
2. A proposal changes a shared contract already marked stable.
3. Multiple agent domains claim authority over the same concept.
4. Any output requires deleting or renaming existing files.
5. The next step cannot be validated by documentation alone.

## Quality Bar

Every accepted output must answer:

1. What problem does this solve?
2. Which module owns it?
3. Which modules consume it?
4. What must not depend on it?
5. What breaks if it changes?
6. How will it be validated?

## Current Recommended Next Step

Create shared contract skeletons before implementation:

```txt
CoordinateContract
SimulationClock
EntityIdContract
TickPhase
CommandEnvelope
EventEnvelope
ValidationScenario
```
