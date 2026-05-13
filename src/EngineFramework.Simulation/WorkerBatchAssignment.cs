namespace EngineFramework.Simulation;

/// <summary>
/// Deterministic mapping between one worker and one execution wave batch.
/// </summary>
public sealed record WorkerBatchAssignment(
    WorkerId WorkerId,
    int WaveIndex,
    ScheduledSystemBatch Batch);
