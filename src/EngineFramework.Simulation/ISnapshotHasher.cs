namespace EngineFramework.Simulation;

public interface ISnapshotHasher
{
    string Hash(SimulationWorld world);
}
