# Project State

Status: Architecture Exploration / Simulation Formalization

This document is the authoritative state file for the Simulation-first Engine Framework.

## Current Project Identity

Repository: `asaholywayweget/4XGameTest`
Project: `引擎框架 v0.1`
Core principle: Simulation-first, architecture-first, deterministic runtime.

## Stable Principles

1. Simulation defines the world.
2. Rendering, gameplay, AI, network, and UI are runtime consumers.
3. Runtime must be deterministic where simulation state matters.
4. Large-scale systems must be modular, streamable, partitionable, and testable.
5. Long-term architecture stability is more important than short-term feature volume.
6. Automated reasoning must not directly rewrite core implementation without explicit human approval.

## Agent Domains

### Coordinator / Arbiter

Owns:
- Task routing
- Conflict detection
- Contract updates
- Risk classification
- Stability promotion

Does not own:
- Domain-specific implementation details
- Runtime code generation without approval

### Core Architecture Agent

Owns:
- ECS / data-oriented boundaries
- Scheduler / tick phase contract
- Module ownership
- Streaming and chunk policy
- Validation workflow
- Simulation ABI boundaries

### Spatial / Coordinate Agent

Owns:
- Universe / sector / chunk addressing
- Planet-scale precision policy
- Camera-relative transform policy
- Origin shifting
- Octree / quadtree / sparse partitioning
- Coordinate contract

### Physics / Rendering Agent

Owns:
- GPU visualization prototypes
- Shader and compute experiments
- SDF / ray marching prototypes
- Physics debug visualization
- Runtime representation consumers

Restriction:
- Must not define global coordinate authority.

### RTS / Entity Simulation Agent

Owns:
- Army / squad / unit hierarchy
- ORBAT simulation model
- Macro / micro grid behavior
- Pathfinding / flow field plans
- Large-scale entity lifecycle

Restriction:
- Must not define its own EntityId, scheduler, or event bus outside shared contracts.

## Shared Contracts To Maintain

- `CoordinateContract`
- `EntityIdContract`
- `ComponentSchema`
- `SimulationClock`
- `TickPhase`
- `CommandEnvelope`
- `EventEnvelope`
- `ChunkAddress`
- `RuntimeProxyContract`
- `ValidationScenario`
- `DebugTelemetry`

## Safety Levels

### Green

Allowed without direct human review:
- Documentation additions
- Architecture notes
- Test scenario descriptions
- Interface proposals
- Risk reports
- Task dispatch packets
- Naming normalization proposals

### Yellow

Requires review before merge or implementation:
- New source modules
- New runtime contracts
- ECS schema changes
- Tick phase changes
- Coordinate system changes
- Serialization format changes

### Red

Forbidden without explicit human approval:
- Rewriting existing runtime code
- Deleting files
- Changing public module ownership
- Changing deterministic simulation semantics
- Introducing external dependencies
- Modifying build, CI, deployment, or generated artifacts

## Stability Promotion Rule

A module or contract can be marked stable only after:

1. Responsibility boundary is explicit.
2. Inputs and outputs are defined.
3. Failure modes are listed.
4. Validation scenario exists.
5. No conflict with existing shared contracts.
6. Coordinator records the decision in this file or a linked contract document.

## Current Open Questions

1. What is the first canonical `CoordinateContract` format?
2. What is the minimum deterministic `SimulationClock`?
3. What is the first stable `EntityId` layout?
4. What belongs in Simulation ABI v0?
5. Which modules are documentation-only for now?

## Next Safe Loop

1. Produce `agent_loop.md`.
2. Produce shared contract skeletons.
3. Produce validation scenario skeletons.
4. Only then consider source-level implementation.
