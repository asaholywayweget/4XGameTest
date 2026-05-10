namespace EngineFramework.Simulation;

public sealed class ChunkIterationPlan
{
    private readonly ChunkBatch[] _batches;

    public ChunkIterationPlan(CachedChunkQuery query, IEnumerable<ChunkBatch> batches)
    {
        Query = query;
        _batches = batches.ToArray();
    }

    public CachedChunkQuery Query { get; }

    public IReadOnlyList<ChunkBatch> Batches => _batches;

    public int TotalEntityCount => _batches.Sum(batch => batch.EntityCount);
}
