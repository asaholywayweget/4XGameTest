using EngineFramework.Core;

namespace EngineFramework.Simulation;

public interface IScheduledSimulationSystem : ISimulationSystem
{
    SimulationSystemDescriptor Descriptor { get; }
}
