namespace EngineFramework.Simulation;

/// <summary>
/// Pairwise conflict graph for system access declarations.
/// </summary>
public sealed class SystemConflictGraph
{
    private readonly List<SystemConflict> _conflicts = new();

    public IReadOnlyList<SystemConflict> Conflicts => _conflicts;

    public void Add(SystemConflict conflict)
    {
        _conflicts.Add(conflict);
    }

    public bool HasConflict(SimulationSystemId a, SimulationSystemId b)
    {
        return _conflicts.Any(conflict =>
            (conflict.A == a && conflict.B == b) ||
            (conflict.A == b && conflict.B == a));
    }
}
