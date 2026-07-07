# Contract Extraction Plan

This document converts the agent-structure review into a safe execution plan.

## Decision

The four conversation domains remain separate agents:

```txt
Core Architecture Agent
Spatial / Coordinate Agent
Physics / Rendering Agent
RTS / Entity Simulation Agent
```

They must not be merged into a single broad agent.

However, cross-domain runtime authority must be extracted into shared contract modules.

## Reason

The current split is correct because each domain has a different failure mode:

- Core can become a monolith if it absorbs every shared concern.
- Spatial can accidentally define render hacks or RTS grid semantics as global coordinate truth.
- Physics / Rendering can pull the project toward visualization-first design.
- RTS can leak Army / Squad / Unit assumptions into generic EntityId, Tick, Event, and ECS design.

The safe structure is therefore:

```txt
Coordinator / Arbiter
    owns review and conflict resolution

Shared Contract Modules
    own cross-domain invariants

Domain Agents
    own specialized proposals and consumers
```

## Extraction Targets

### 1. Shared.Contracts.Coordinate

Purpose:
- Define canonical address and transform boundaries.
- Prevent RTS macro/micro grid or rendering camera-relative transforms from becoming global truth.

Primary consumers:
- Core Architecture
- Spatial / Coordinate
- RTS / Entity Simulation
- Physics / Rendering

Initial document:

```txt
docs/specification/coordinate_contract.md
```

Do not decide final precision layout yet.

### 2. Shared.Contracts.Time

Purpose:
- Define deterministic simulation time authority.
- Separate render frame time from simulation tick time.
- Define what is allowed to run variable-rate and what must commit deterministically.

Initial documents:

```txt
docs/runtime/simulation_clock.md
docs/runtime/tick_phase.md
```

Do not finalize tick phase ordering yet.

### 3. Shared.Contracts.Identity

Purpose:
- Define EntityId ownership and lifecycle expectations.
- Prevent RTS Army/Squad/Unit hierarchy from becoming the universal entity identity model.

Initial document:

```txt
docs/runtime/entity_id_contract.md
```

Do not finalize bit layout yet.

### 4. Shared.Contracts.CommandEvent

Purpose:
- Define command/event envelope boundary.
- Prevent RTS, UI, network, or validation from owning their own incompatible event bus.

Initial document:

```txt
docs/runtime/command_event_envelope.md
```

Do not implement event dispatch yet.

### 5. Shared.Contracts.ComponentSchema

Purpose:
- Define where ECS schema authority lives.
- Separate universal component structure from domain-level aggregates.

Initial document:

```txt
docs/runtime/component_schema.md
```

Do not generate runtime component code yet.

### 6. Shared.Contracts.RuntimeProxy

Purpose:
- Define how rendering, debug UI, and visualization consume simulation state.
- Prevent visual transform or reduced physics proxy from mutating canonical simulation state.

Initial document:

```txt
docs/runtime/runtime_proxy_contract.md
```

Do not implement renderer integration yet.

### 7. Shared.Contracts.Validation

Purpose:
- Define validation scenario shape and pass/fail authority.
- Give each domain a way to propose tests without owning global correctness.

Initial document:

```txt
docs/validation/validation_scenarios.md
```

Do not create executable tests yet.

### 8. Shared.Contracts.Telemetry

Purpose:
- Define debug and profiling output boundaries.
- Prevent debug UI from becoming implicit runtime authority.

Initial document:

```txt
docs/runtime/debug_telemetry.md
```

Do not implement UI panels yet.

## Dependency Order

Recommended safe order:

```txt
1. CoordinateContract
2. SimulationClock
3. EntityIdContract
4. TickPhase
5. CommandEventEnvelope
6. ComponentSchema
7. RuntimeProxyContract
8. ValidationScenarios
9. DebugTelemetry
```

Rationale:

- Coordinate, time, and identity are foundational.
- Tick phase depends on time.
- Commands and events depend on time and identity.
- Component schema depends on identity and ECS boundaries.
- Runtime proxy depends on coordinate, time, identity, and component schema.
- Validation depends on all of the above.
- Telemetry should observe rather than define behavior.

## Agent Ownership After Refactor

| Module | Authority | Proposal Sources | Consumers |
|---|---|---|---|
| Coordinate | Shared Contract + Coordinator | Spatial | Core, RTS, Rendering, Physics |
| Time | Shared Contract + Coordinator | Core | RTS, Physics, Rendering, Validation |
| Identity | Shared Contract + Coordinator | Core, RTS | All simulation domains |
| Command/Event | Shared Contract + Coordinator | Core, RTS, Network/UI later | All runtime domains |
| ComponentSchema | Shared Contract + Coordinator | Core, RTS | ECS, Serialization, Validation |
| RuntimeProxy | Shared Contract + Coordinator | Core, Rendering, Physics | Rendering, Debug, Streaming |
| Validation | Shared Contract + Coordinator | All domains | Coordinator, CI later |
| Telemetry | Shared Contract + Coordinator | Core, Rendering | Debug UI, Profiling, Validation |

## Merge Decision

Do not merge:

```txt
Spatial + Rendering
Core + RTS
Physics + Rendering + Spatial
All four domains into Core
```

Allowed partial sharing:

```txt
Coordinate types
Entity identity rules
Tick/time model
Command/event envelope
Validation scenario format
Runtime proxy format
Telemetry schema
```

## Green Tasks

Allowed without implementation review:

- Create contract skeleton documents.
- Add conflict checklists.
- Add ownership tables.
- Add validation scenario outlines.
- Add ADR notes.

## Yellow Tasks

Require explicit review:

- Marking a contract stable.
- Choosing final EntityId bit layout.
- Choosing final coordinate precision hierarchy.
- Choosing final tick phase order.
- Choosing serialization format.
- Creating source-level interfaces.

## Red Tasks

Do not perform unattended:

- Modify `/src`.
- Rewrite runtime behavior.
- Delete or rename files.
- Change build or dependency files.
- Implement event bus, ECS storage, renderer, or simulation scheduler.

## Current Next Safe Step

Create documentation-only skeletons for the first three foundational contracts:

```txt
docs/specification/coordinate_contract.md
docs/runtime/simulation_clock.md
docs/runtime/entity_id_contract.md
```

Each skeleton should include:

```txt
Purpose
Authority
Owned Concepts
Consumed By
Non-Goals
Open Decisions
Validation Notes
Risk Level
```
