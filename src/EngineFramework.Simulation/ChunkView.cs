namespace EngineFramework.Simulation;

/// <summary>
/// Read/write view over one archetype chunk.
/// </summary>
public readonly ref struct ChunkView
{
    private readonly ArchetypeChunk _chunk;

    public ChunkView(ArchetypeChunk chunk)
    {
        _chunk = chunk;
    }

    public int Count => _chunk.Count;

    public EntityId GetEntityId(int rowIndex) => _chunk.GetEntityId(rowIndex);

    public ChunkColumn<T> GetColumn<T>() where T : struct, IComponent => _chunk.GetColumn<T>();
}
