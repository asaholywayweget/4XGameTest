namespace EngineFramework.Simulation;

/// <summary>
/// A deterministic execution wave containing systems that may execute concurrently in the future.
/// </summary>
public sealed class ExecutionWave
{
    private readonly ScheduledSystemBatch[] _batches;

    public ExecutionWave(int index, IEnumerable<ScheduledSystemBatch> batches)
    {
        if (index < 0)
            throw new ArgumentOutOfRangeException(nameof(index));

        Index = index;
        _batches = batches.ToArray();
    }

    public int Index { get; }

    public IReadOnlyList<ScheduledSystemBatch> Batches => _batches;
}
