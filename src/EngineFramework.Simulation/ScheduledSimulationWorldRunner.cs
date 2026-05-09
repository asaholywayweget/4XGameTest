using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class ScheduledSimulationWorldRunner
{
    private readonly SimulationWorld _world;
    private readonly SimulationSchedule _schedule;

    public ScheduledSimulationWorldRunner(SimulationWorld world, SimulationSchedule schedule)
    {
        _world = world;
        _schedule = schedule;
    }

    public void Tick(EngineTime time)
    {
        foreach (var system in _schedule.Systems)
            system.Tick(_world, time);
    }
}
