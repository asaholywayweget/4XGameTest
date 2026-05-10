namespace EngineFramework.Simulation;

/// <summary>
/// Registry for frequently used queries. Keeps hot-path query descriptors stable and named.
/// </summary>
public sealed class HotPathQueryRegistry
{
    private readonly ChunkQueryCache _cache = new();

    public ChunkQueryCache Cache => _cache;

    public CachedChunkQuery RegisterRead<T>(string key) where T : IComponent
    {
        return _cache.GetOrAdd(key, ChunkQuery.Read<T>, ChunkAccessPattern.HotPath);
    }

    public CachedChunkQuery RegisterWrite<T>(string key) where T : IComponent
    {
        return _cache.GetOrAdd(key, ChunkQuery.Write<T>, ChunkAccessPattern.HotPath);
    }
}
