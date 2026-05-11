namespace EngineFramework.Simulation;

public interface IChunkBatchJob
{
    string Name { get; }

    void Execute(ChunkBatch batch, BatchExecutionContext context);
}
