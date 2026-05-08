# Module Boundaries

Core layers:

- Core
- Math
- Space
- Simulation
- Physics
- World
- Database
- Rendering
- Networking
- Debug
- Tooling

Rules:

- low coupling
- replaceable modules
- explicit ownership
- no renderer dependency in simulation core
- no database dependency in math layer
