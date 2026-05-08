# Simulation Pipeline

Simulation flow:

Input
 -> Command Queue
 -> Scheduler
 -> ECS / Systems
 -> Physics Step
 -> Spatial Update
 -> Snapshot
 -> Render Adapter
 -> Replay / Validation

Long-term goals:
- deterministic simulation
- replay support
- rollback support
- distributed simulation
