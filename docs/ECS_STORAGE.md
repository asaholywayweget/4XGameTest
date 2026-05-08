# ECS Storage Blueprint

Version: v0.1

Purpose:
Define the first data-oriented storage direction without locking the engine into a premature implementation.

Initial concepts:

- ComponentTypeId
- ArchetypeId
- ArchetypeSignature
- EntityRecord
- IComponentStorage
- ArchetypeStorage
- ArchetypeRegistry
- SimulationQuery

Current stage:

The first implementation is intentionally minimal.
It defines topology and query contracts before high-performance storage.

Future direction:

1. Replace object components with struct-friendly storage.
2. Introduce chunked SoA layout.
3. Add query caching.
4. Add scheduler integration.
5. Add deterministic iteration order.
6. Add snapshot serialization support.

Rules:

- Simulation owns authoritative ECS state.
- Renderer reads snapshots only.
- Physics integrates through systems, not ownership inversion.
- Database persists snapshots and rules, not live state ownership.
