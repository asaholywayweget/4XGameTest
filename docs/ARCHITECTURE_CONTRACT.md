# Architecture Contract

Version: v0.1

Rules:

1. Simulation core must not depend on rendering.
2. Math layer must not depend on database, UI, physics engine, or renderer.
3. Space layer owns coordinates, chunks, partitioning, and origin shifting.
4. Simulation layer owns tick order, scheduler, commands, snapshots, and replay.
5. Physics layer must be replaceable.
6. Rendering layer is only an adapter.
7. Database layer stores state, schema, constants, snapshots, and validation data.
8. Debug tools observe systems without owning simulation state.
