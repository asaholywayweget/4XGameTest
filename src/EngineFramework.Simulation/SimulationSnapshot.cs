using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Minimal deterministic snapshot primitive.
/// </summary>
public readonly record struct SimulationSnapshot(
    EngineTick Tick,
    int EntityCount,
    DateTime CreatedUtc);
