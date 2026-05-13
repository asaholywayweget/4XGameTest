namespace EngineFramework.Simulation;

/// <summary>
/// Represents a set of batches without declared access conflicts.
/// </summary>
public sealed class ConflictFreeBatchGroup
{
    private readonly ScheduledSystemBatch[] _batches;

    public ConflictFreeBatchGroup(IEnumerable<ScheduledSystemBatch> batches)
    {
        _batches = batches.ToArray();
    }

    public IReadOnlyList<ScheduledSystemBatch> Batches => _batches;
}
