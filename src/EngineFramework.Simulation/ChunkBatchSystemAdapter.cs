using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Adapts an IScheduledChunkSystem into an IChunkBatchJob.
/// </summary>
public sealed class ChunkBatchSystemAdapter : IChunkBatchJob
{
    private readonly IScheduledChunkSystem _system;

    public ChunkBatchSystemAdapter(IScheduledChunkSystem system)
    {
        _system = system;
    }

    public string Name => _system.Name;

    public void Execute(ChunkBatch batch, BatchExecutionContext context)
    {
        foreach (var chunk in batch.Chunks)
            _system.TickChunk(new ChunkView(chunk), context.Time);
    }
}
