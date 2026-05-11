namespace EngineFramework.Simulation;

/// <summary>
/// Execution policy for batch runners.
/// v0.1 supports deterministic synchronous execution only.
/// </summary>
public enum ThreadExecutionPolicy
{
    Synchronous,
    ParallelPreview
}
