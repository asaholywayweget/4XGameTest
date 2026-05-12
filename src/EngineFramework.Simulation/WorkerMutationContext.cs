namespace EngineFramework.Simulation;

/// <summary>
/// Worker-scoped mutation submission context.
/// </summary>
public sealed class WorkerMutationContext
{
    public WorkerMutationContext(WorkerId workerId, ThreadLocalCommandBuffer commandBuffer)
    {
        WorkerId = workerId;
        CommandBuffer = commandBuffer;
    }

    public WorkerId WorkerId { get; }

    public ThreadLocalCommandBuffer CommandBuffer { get; }
}
