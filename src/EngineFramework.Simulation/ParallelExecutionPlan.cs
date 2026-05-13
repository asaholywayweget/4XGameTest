namespace EngineFramework.Simulation;

/// <summary>
/// Deterministic execution topology for future parallel runtime execution.
/// v0.1 establishes topology only and does not start threads.
/// </summary>
public sealed class ParallelExecutionPlan
{
    private readonly ExecutionWave[] _waves;

    public ParallelExecutionPlan(IEnumerable<ExecutionWave> waves)
    {
        _waves = waves.ToArray();
    }

    public IReadOnlyList<ExecutionWave> Waves => _waves;

    public int TotalBatchCount => _waves.Sum(wave => wave.Batches.Count);
}
