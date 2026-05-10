namespace EngineFramework.Simulation;

public sealed record ChunkRelocationResult(
    bool Success,
    ChunkRelocation? Relocation,
    string? Warning)
{
    public static ChunkRelocationResult Failed(string warning) => new(false, null, warning);

    public static ChunkRelocationResult Completed(ChunkRelocation relocation) => new(true, relocation, null);
}
