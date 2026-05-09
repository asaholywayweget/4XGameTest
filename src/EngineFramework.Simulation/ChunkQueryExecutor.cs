namespace EngineFramework.Simulation;

public sealed class ChunkQueryExecutor
{
    private readonly ChunkedArchetypeRegistry _registry;

    public ChunkQueryExecutor(ChunkedArchetypeRegistry registry)
    {
        _registry = registry;
    }

    public ChunkQueryCursor Execute(ChunkQuery query)
    {
        return new ChunkQueryCursor(_registry.Query(query.SimulationQuery));
    }
}
