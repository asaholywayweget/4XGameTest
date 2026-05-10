namespace EngineFramework.Simulation;

/// <summary>
/// Result of moving an entity from one chunk location to another.
/// </summary>
public sealed record ChunkRelocation(
    EntityId EntityId,
    ChunkCursor Source,
    ChunkCursor Target,
    EntityId MovedEntityFromSourceSwapBack);
