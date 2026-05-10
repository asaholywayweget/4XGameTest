using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed record RecordedCommand(
    EngineTick Tick,
    string Type,
    IReadOnlyDictionary<string, string> Arguments);
