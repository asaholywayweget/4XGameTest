namespace EngineFramework.Core;

public readonly record struct DiagnosticsMessage(
    DiagnosticsLevel Level,
    string Source,
    string Message,
    EngineTick Tick);
