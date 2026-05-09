using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class ChunkSystemRunner
{
    private readonly ChunkQueryExecutor _executor;

    public ChunkSystemRunner(ChunkQueryExecutor executor)
    {
        _executor = executor;
    }

    public void Tick(IScheduledChunkSystem system, EngineTime time)
    {
        var cursor = _executor.Execute(system.Query);
        foreach (var chunk in cursor.Chunks())
            system.TickChunk(new ChunkView(chunk), time);
    }
}
