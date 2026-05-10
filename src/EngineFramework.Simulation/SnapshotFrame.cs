using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Runtime snapshot frame used by replay and validation systems.
/// </summary>
public sealed record SnapshotFrame(
    EngineTick Tick,
    int EntityCount,
    string StateHash);
