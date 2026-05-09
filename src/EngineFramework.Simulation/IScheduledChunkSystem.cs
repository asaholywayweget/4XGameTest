using EngineFramework.Core;

namespace EngineFramework.Simulation;

public interface IScheduledChunkSystem : IScheduledSimulationSystem
{
    ChunkQuery Query { get; }

    void TickChunk(ChunkView chunk, EngineTime time);
}
