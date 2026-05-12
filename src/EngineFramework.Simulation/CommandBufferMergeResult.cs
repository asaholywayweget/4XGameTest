namespace EngineFramework.Simulation;

public sealed record CommandBufferMergeResult(
    int SourceBuffers,
    int MergedCommands);
