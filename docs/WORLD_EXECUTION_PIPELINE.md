# World Execution Pipeline

Version: v0.1

Purpose:
Connect the simulation primitives into a deterministic runtime frame pipeline.

Initial concepts:

- ExecutionStageType
- RuntimeTickContext
- IRuntimeStage
- RuntimePipeline
- RuntimePipelineBuilder
- SimulationStage
- MutationBarrierStage
- SnapshotStage
- SimulationRuntime
- DefaultRuntimePipelineFactory

Frame order:

1. BeginFrame
2. Input
3. Commands
4. Simulation
5. MutationBarrier
6. Snapshot
7. EndFrame

Current scope:

- single-threaded orchestration
- deterministic stage ordering
- mutation barrier integration
- snapshot capture after mutations

Future direction:

1. command ingestion stage
2. replay input stage
3. execution plan stage
4. parallel batch runner
5. diagnostics stage
6. rollback checkpoints
7. distributed sync hooks

Rules:

- Structural mutations occur only at MutationBarrier.
- Snapshots are captured after structural playback.
- Rendering is not part of authoritative runtime.
- Runtime owns orchestration, not domain-specific simulation logic.
