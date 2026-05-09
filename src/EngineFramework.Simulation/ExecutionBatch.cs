namespace EngineFramework.Simulation;

/// <summary>
/// A set of systems that may run in the same execution batch.
/// Current implementation is preparation-only and does not execute in parallel.
/// </summary>
public sealed class ExecutionBatch
{
    private readonly List<SimulationSystemId> _systems = new();

    public ExecutionBatch(SimulationPhase phase, int index)
    {
        Phase = phase;
        Index = index;
    }

    public SimulationPhase Phase { get; }

    public int Index { get; }

    public IReadOnlyList<SimulationSystemId> Systems => _systems;

    public void Add(SimulationSystemId systemId)
    {
        _systems.Add(systemId);
    }
}
