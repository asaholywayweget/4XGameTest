namespace EngineFramework.Simulation;

public sealed class ChunkBatchBuilder
{
    private readonly ChunkBatchingPolicy _policy;

    public ChunkBatchBuilder(ChunkBatchingPolicy policy)
    {
        policy.Validate();
        _policy = policy;
    }

    public IReadOnlyList<ChunkBatch> Build(IEnumerable<ArchetypeChunk> chunks)
    {
        var batches = new List<ChunkBatch>();
        var current = new List<ArchetypeChunk>(_policy.MaxChunksPerBatch);

        foreach (var chunk in chunks)
        {
            current.Add(chunk);
            if (current.Count >= _policy.MaxChunksPerBatch)
                Flush();
        }

        Flush();
        return batches;

        void Flush()
        {
            if (current.Count == 0)
                return;

            batches.Add(new ChunkBatch(batches.Count, current));
            current = new List<ArchetypeChunk>(_policy.MaxChunksPerBatch);
        }
    }
}
