namespace EngineFramework.Simulation;

public sealed class ChunkQueryCursor
{
    private readonly ChunkedArchetypeStorage[] _storages;

    public ChunkQueryCursor(IEnumerable<ChunkedArchetypeStorage> storages)
    {
        _storages = storages.ToArray();
    }

    public IEnumerable<ArchetypeChunk> Chunks()
    {
        foreach (var storage in _storages)
        {
            foreach (var chunk in storage.Chunks)
                yield return chunk;
        }
    }
}
