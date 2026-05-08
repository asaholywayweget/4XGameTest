# Threading Model

Execution model:

Main Thread
 -> Simulation Threads
 -> Physics Threads
 -> Streaming Threads
 -> GPU Tasks

Rules:

- minimize shared mutable state
- prefer job queues
- deterministic simulation priority
- renderer must not block simulation core
