namespace EngineFramework.Simulation;

/// <summary>
/// Caches chunk query descriptors. This does not cache live chunks yet.
/// </summary>
public sealed class ChunkQueryCache
{
    private readonly Dictionary<string, CachedChunkQuery> _queries = new(StringComparer.Ordinal);

    public int Count => _queries.Count;

    public CachedChunkQuery GetOrAdd(string key, Func<ChunkQuery> factory, ChunkAccessPattern accessPattern = ChunkAccessPattern.Sequential)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Query cache key cannot be empty.", nameof(key));

        if (_queries.TryGetValue(key, out var cached))
            return cached;

        cached = new CachedChunkQuery(key, factory(), accessPattern);
        _queries.Add(key, cached);
        return cached;
    }

    public bool TryGet(string key, out CachedChunkQuery query)
    {
        return _queries.TryGetValue(key, out query!);
    }

    public void Clear() => _queries.Clear();
}
