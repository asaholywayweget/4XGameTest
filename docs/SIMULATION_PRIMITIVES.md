# Simulation Primitives

Version: v0.1

Purpose:
Provide the first deterministic simulation primitives.

Initial types:

- EntityId
- IComponent
- SimulationEntity
- SimulationWorld
- ISimulationSystem
- SimulationCommand
- CommandQueue
- SimulationSnapshot

Rules:

1. Simulation owns authoritative state.
2. Rendering must observe simulation, not own it.
3. Systems operate through world state.
4. Commands should remain deterministic.
5. Snapshots must support replay and validation later.
6. Simulation primitives should stay independent from rendering and database implementations.
