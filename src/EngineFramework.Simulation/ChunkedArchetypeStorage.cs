namespace EngineFramework.Simulation;

/// <summary>
/// Managed chunked archetype storage. This is the first physical ECS layout step.
/// </summary>
public sealed class ChunkedArchetypeStorage
{
    private readonly List<ArchetypeChunk> _chunks = new();

    public ChunkedArchetypeStorage(ArchetypeSignature signature, ChunkCapacityPolicy capacityPolicy)
    {
        Signature = signature;
        CapacityPolicy = capacityPolicy;
    }

    public ArchetypeSignature Signature { get; }

    public ChunkCapacityPolicy CapacityPolicy { get; }

    public IReadOnlyList<ArchetypeChunk> Chunks => _chunks;

    public ChunkCursor AddEntity(EntityId entityId)
    {
        var chunkIndex = FindWritableChunkIndex();
        var chunk = _chunks[chunkIndex];
        var row = chunk.AddEntity(entityId);
        return new ChunkCursor(Signature.Id, chunkIndex, row);
    }

    public ArchetypeChunk GetChunk(int index) => _chunks[index];

    private int FindWritableChunkIndex()
    {
        for (var i = 0; i < _chunks.Count; i++)
        {
            if (!_chunks[i].IsFull)
                return i;
        }

        _chunks.Add(new ArchetypeChunk(Signature, CapacityPolicy));
        return _chunks.Count - 1;
    }
}
