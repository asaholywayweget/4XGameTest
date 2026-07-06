# Agent Structure Review

## Decision Summary

The four current conversation domains should not be merged into one agent.

They should remain separate as domain agents, but several responsibilities must be refactored into shared modules and contract documents.

Recommended structure:

```txt
Coordinator / Arbiter
    owns decision routing and conflict resolution

Shared Contract Modules
    own cross-domain runtime contracts

Domain Agents
    Core Architecture Agent
    Spatial / Coordinate Agent
    Physics / Rendering Agent
    RTS / Entity Simulation Agent
```

## Final Recommendation

| Domain | Decision | Reason |
|---|---|---|
| Coordinator / Arbiter | Keep separate | Needs neutral authority over conflicts, risk level, and stability promotion. |
| Core Architecture Agent | Keep separate, narrow authority | Owns scheduler, ECS boundaries, ABI, validation process. Must not absorb every domain. |
| Spatial / Coordinate Agent | Keep separate, but move common address types into shared contracts | Coordinate authority is specialized and high-risk. |
| Physics / Rendering Agent | Keep separate, treat mostly as consumer/prototype agent | Should consume runtime representation and coordinate contracts, not define them. |
| RTS / Entity Simulation Agent | Keep separate, but refactor identity/tick/events/path interfaces into shared contracts | ORBAT and entity lifecycle are domain-specific, but identity and simulation timing are not. |

## Required Refactor

The current agent structure is usable, but only if shared authority is extracted from domain agents.

Create the following shared modules:

```txt
Shared.Contracts.Coordinate
Shared.Contracts.Identity
Shared.Contracts.Time
Shared.Contracts.CommandEvent
Shared.Contracts.ComponentSchema
Shared.Contracts.Validation
Shared.Contracts.Telemetry
Shared.Contracts.RuntimeProxy
```

These are not implementation modules yet. They are authority boundaries and contract skeletons.

## Why Not Merge The Four Domains?

A single combined agent would appear simpler, but it would create architectural risk:

1. Coordinate decisions would leak into rendering and RTS pathfinding.
2. RTS entity assumptions would contaminate the generic ECS model.
3. Rendering prototypes would pressure the architecture toward visualization-first design.
4. Scheduler and tick semantics would be modified opportunistically by domain needs.
5. Conflict detection would disappear because the same agent would both propose and approve changes.

The project is simulation-first and architecture-first, so losing separation would contradict the current project principle.

## Why Not Keep Them Fully Independent?

Fully independent agents would also be unsafe.

The following concepts are cross-domain and must not be owned by only one domain agent:

- Entity identity
- Simulation clock
- Tick phase order
- Coordinate address layout
- Command envelope
- Event envelope
- Runtime proxy format
- Component schema
- Validation scenario format
- Debug telemetry format

These should become shared contracts reviewed through the Coordinator / Arbiter.

## Domain Boundary Review

### Coordinator / Arbiter

Decision: keep separate.

Owns:

- Task routing
- Conflict detection
- Risk classification
- Stability promotion
- Final shared-contract acceptance

Must not own:

- Physics equations
- Rendering implementation
- RTS rules
- Coordinate math internals
- Low-level ECS storage details

Reason:

The Coordinator is the only agent that can reject conflicting proposals without being the author of those proposals.

### Core Architecture Agent

Decision: keep separate, but constrain scope.

Owns:

- ECS/data-oriented boundaries
- Module ownership
- Scheduler contract
- Simulation ABI
- Chunk/streaming architecture
- Validation workflow

Should consume from shared modules:

- Coordinate contract
- EntityId contract
- Command/Event envelopes
- SimulationClock and TickPhase

Risk:

If Core Architecture owns every shared concern directly, it becomes a monolithic authority and weakens domain isolation.

### Spatial / Coordinate Agent

Decision: keep separate.

Owns:

- Universe/sector/chunk addressing concepts
- Planet-scale precision policy proposals
- Camera-relative transform policy proposals
- Origin shifting strategy
- Octree/quadtree/sparse partitioning strategy

Should not own alone:

- EntityId
- Event bus
- Scheduler
- Rendering coordinate hacks
- RTS macro/micro movement rules

Refactor target:

Move the public-facing coordinate types and address invariants into `Shared.Contracts.Coordinate`.

### Physics / Rendering Agent

Decision: keep separate, but classify as runtime consumer and prototype domain.

Owns:

- GPU visualization prototypes
- Shader experiments
- Compute experiments
- SDF/ray marching experiments
- Physics debug visualization
- Runtime representation consumption

Must not own:

- Global coordinate authority
- Canonical simulation state
- Entity identity
- Tick order
- Validation pass/fail authority

Reason:

Rendering and physics visualization are essential, but they should not pull the engine into rendering-first architecture.

### RTS / Entity Simulation Agent

Decision: keep separate, but refactor shared concerns outward.

Owns:

- Army/squad/unit hierarchy
- ORBAT model
- Macro/micro grid behavior
- Pathfinding and flow-field planning
- Large-scale entity lifecycle behavior

Must not own alone:

- EntityId layout
- Scheduler
- Event envelope
- Component schema
- Coordinate address authority

Refactor target:

RTS should define domain components and behaviors, but use shared identity, time, command, event, and coordinate contracts.

## Shared Module Extraction Map

| Shared Module | Extract From | Consumed By |
|---|---|---|
| `Shared.Contracts.Coordinate` | Spatial | Core, RTS, Rendering, Physics |
| `Shared.Contracts.Identity` | Core + RTS | All simulation modules |
| `Shared.Contracts.Time` | Core | RTS, Physics, Rendering, Validation |
| `Shared.Contracts.CommandEvent` | Core + RTS | AI, Network, UI, RTS, Simulation Runtime |
| `Shared.Contracts.ComponentSchema` | Core + RTS | ECS, Serialization, Validation |
| `Shared.Contracts.Validation` | Core | All agents |
| `Shared.Contracts.Telemetry` | Core + Rendering | Debug UI, validation, profiling |
| `Shared.Contracts.RuntimeProxy` | Core + Physics/Rendering | Rendering, debug, streaming, visualization |

## Refactored Topology

```txt
Coordinator / Arbiter
    ↓ approves
Shared Contract Modules
    Coordinate
    Identity
    Time
    CommandEvent
    ComponentSchema
    Validation
    Telemetry
    RuntimeProxy
    ↓ consumed by
Core Architecture Agent
Spatial / Coordinate Agent
Physics / Rendering Agent
RTS / Entity Simulation Agent
```

## Conflict Hotspots

### 1. Coordinate vs RTS Grid

RTS wants macro/micro cells.
Spatial wants universe/sector/chunk/planet-local addressing.

Resolution:

RTS grid must be a consumer projection of the CoordinateContract, not an independent coordinate authority.

### 2. Core ECS vs RTS Entity Hierarchy

RTS wants Army/Squad/Unit.
Core wants generic ECS/data-oriented layout.

Resolution:

Army/Squad/Unit are domain-level semantic aggregates, not the universal entity model.

### 3. Rendering Transform vs Simulation Transform

Rendering wants camera-relative FP32.
Simulation wants deterministic world state.

Resolution:

Rendering transform is a RuntimeProxy projection. It must not become canonical simulation state.

### 4. Physics Tick vs Simulation Tick

Physics prototypes may want variable-rate integration.
Simulation wants deterministic tick semantics.

Resolution:

Variable-rate physics can exist only as a subsystem behind a deterministic sampling or commit contract.

### 5. Event Bus Ownership

RTS, UI, network, simulation, and validation all need events.

Resolution:

No domain owns the event bus. Shared Command/Event envelopes define the boundary.

## Action Plan

### Immediate Green Tasks

Create documentation-only skeletons:

```txt
docs/specification/coordinate_contract.md
docs/runtime/entity_id_contract.md
docs/runtime/simulation_clock.md
docs/runtime/tick_phase.md
docs/runtime/command_event_envelope.md
docs/runtime/component_schema.md
docs/runtime/runtime_proxy_contract.md
docs/validation/validation_scenarios.md
docs/runtime/debug_telemetry.md
```

### Yellow Tasks Requiring Review

- Approving stable EntityId bit/layout format
- Approving canonical coordinate precision model
- Approving tick phase order
- Approving serialization boundaries
- Approving command/event schema

### Red Tasks To Avoid For Now

- Rewriting `/src`
- Creating large implementation modules
- Introducing dependencies
- Changing build files
- Deleting or renaming repo files

## Decision Record

Decision:

Keep the four domain agents separate.

Refactor cross-domain runtime authority into shared contract modules.

Do not merge Physics/Rendering with Spatial.
Do not merge RTS with Core Architecture.
Do not allow any domain agent to define EntityId, TickPhase, EventEnvelope, or CoordinateContract alone.

## Next Safe Step

Create shared contract skeletons in this order:

1. `coordinate_contract.md`
2. `simulation_clock.md`
3. `entity_id_contract.md`
4. `tick_phase.md`
5. `command_event_envelope.md`
6. `validation_scenarios.md`

This preserves agent separation while removing duplicated authority.
