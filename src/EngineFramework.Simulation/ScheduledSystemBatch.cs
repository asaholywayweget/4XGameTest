namespace EngineFramework.Simulation;

/// <summary>
/// Deterministic batch of scheduled simulation systems.
/// This is a scheduling topology primitive, not a worker runtime primitive.
/// </summary>
public sealed class ScheduledSystemBatch
{
    private readonly IScheduledSimulationSystem[] _systems;

    public ScheduledSystemBatch(int index, IEnumerable<IScheduledSimulationSystem> systems)
    {
        if (index < 0)
            throw new ArgumentOutOfRangeException(nameof(index));

        Index = index;
        _systems = systems.ToArray();
    }

    public int Index { get; }

    public IReadOnlyList<IScheduledSimulationSystem> Systems => _systems;
}
