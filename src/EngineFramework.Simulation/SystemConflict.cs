namespace EngineFramework.Simulation;

public readonly record struct SystemConflict(
    SimulationSystemId A,
    SimulationSystemId B,
    string Reason);
