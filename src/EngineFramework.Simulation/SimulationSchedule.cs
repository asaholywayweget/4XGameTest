namespace EngineFramework.Simulation;

public sealed class SimulationSchedule
{
    private readonly IScheduledSimulationSystem[] _systems;

    public SimulationSchedule(IEnumerable<IScheduledSimulationSystem> systems)
    {
        _systems = systems.ToArray();
    }

    public IReadOnlyList<IScheduledSimulationSystem> Systems => _systems;
}
