namespace EngineFramework.Simulation;

public sealed record CommandPlaybackResult(
    int AppliedCount,
    IReadOnlyList<string> Warnings);
