using EngineFramework.Core;

namespace EngineFramework.Simulation;

public interface ISimulationSystem
{
    string Name { get; }

    void Tick(SimulationWorld world, EngineTime time);
}
