namespace EngineFramework.Simulation;

/// <summary>
/// Coarse deterministic execution phases for simulation systems.
/// </summary>
public enum SimulationPhase
{
    PreSimulation = 0,
    Input = 100,
    Simulation = 200,
    Physics = 300,
    Spatial = 400,
    PostSimulation = 500,
    Snapshot = 600
}
