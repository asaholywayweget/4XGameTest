namespace EngineFramework.Simulation;

/// <summary>
/// Capacity policy for archetype chunks.
/// This is intentionally explicit so future native/SoA storage can preserve behavior.
/// </summary>
public readonly record struct ChunkCapacityPolicy(int EntitiesPerChunk)
{
    public static ChunkCapacityPolicy Default { get; } = new(1024);
    public static ChunkCapacityPolicy Small { get; } = new(128);

    public void Validate()
    {
        if (EntitiesPerChunk <= 0)
            throw new InvalidOperationException("EntitiesPerChunk must be positive.");
    }
}
