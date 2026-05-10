namespace EngineFramework.Simulation;

/// <summary>
/// A deterministic batch of archetype chunks prepared for iteration.
/// Future versions may map one batch to one job.
/// </summary>
public sealed class ChunkBatch
{
    private readonly ArchetypeChunk[] _chunks;

    public ChunkBatch(int index, IEnumerable<ArchetypeChunk> chunks)
    {
        if (index < 0)
            throw new ArgumentOutOfRangeException(nameof(index));

        Index = index;
        _chunks = chunks.ToArray();
    }

    public int Index { get; }

    public IReadOnlyList<ArchetypeChunk> Chunks => _chunks;

    public int EntityCount => _chunks.Sum(chunk => chunk.Count);
}
