namespace EngineFramework.Simulation;

public sealed record CachedChunkQuery(
    string Key,
    ChunkQuery Query,
    ChunkAccessPattern AccessPattern);
