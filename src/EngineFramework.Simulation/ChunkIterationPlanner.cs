namespace EngineFramework.Simulation;

public sealed class ChunkIterationPlanner
{
    private readonly ChunkQueryExecutor _executor;
    private readonly ChunkBatchBuilder _batchBuilder;

    public ChunkIterationPlanner(ChunkQueryExecutor executor, ChunkBatchingPolicy batchingPolicy)
    {
        _executor = executor;
        _batchBuilder = new ChunkBatchBuilder(batchingPolicy);
    }

    public ChunkIterationPlan Plan(CachedChunkQuery cachedQuery)
    {
        var cursor = _executor.Execute(cachedQuery.Query);
        var batches = _batchBuilder.Build(cursor.Chunks());
        return new ChunkIterationPlan(cachedQuery, batches);
    }
}
