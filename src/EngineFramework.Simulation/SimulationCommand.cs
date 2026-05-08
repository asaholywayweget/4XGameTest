using EngineFramework.Core;

namespace EngineFramework.Simulation;

public readonly record struct SimulationCommand(
    EngineTick Tick,
    string Type,
    IReadOnlyDictionary<string, string> Arguments);
