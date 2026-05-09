# System Scheduler

Version: v0.1

Purpose:
Define deterministic execution ordering for simulation systems.

Initial concepts:

- SimulationPhase
- SimulationSystemId
- SimulationSystemDescriptor
- IScheduledSimulationSystem
- SystemScheduler
- SimulationSchedule
- ScheduledSimulationWorldRunner

Current scope:

The first scheduler is deterministic and single-threaded.
It validates dependency integrity before execution.

Validation rules:

1. System ids must be unique.
2. Dependencies must exist.
3. Self-dependency is forbidden.
4. Dependency cycles are forbidden.
5. Ordering is phase, order, id.

Future direction:

1. Parallel execution batches.
2. Read/write component access declarations.
3. Job graph generation.
4. Thread-safe command buffering.
5. Replay-compatible execution traces.

Important rule:

Multithreading must not be introduced until dependencies and data access are explicit.
