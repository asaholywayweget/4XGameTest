namespace EngineFramework.Simulation;

public readonly record struct ChunkBatchingPolicy(int MaxChunksPerBatch)
{
    public static ChunkBatchingPolicy Default { get; } = new(16);
    public static ChunkBatchingPolicy SingleChunk { get; } = new(1);

    public void Validate()
    {
        if (MaxChunksPerBatch <= 0)
            throw new InvalidOperationException("MaxChunksPerBatch must be positive.");
    }
}
