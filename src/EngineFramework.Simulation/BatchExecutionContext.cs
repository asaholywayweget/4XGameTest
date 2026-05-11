using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class BatchExecutionContext
{
    public BatchExecutionContext(
        EngineTime time,
        ChunkIterationPlan plan,
        DeferredCommandBuffer commandBuffer)
    {
        Time = time;
        Plan = plan;
        CommandBuffer = commandBuffer;
    }

    public EngineTime Time { get; }

    public ChunkIterationPlan Plan { get; }

    public DeferredCommandBuffer CommandBuffer { get; }
}
