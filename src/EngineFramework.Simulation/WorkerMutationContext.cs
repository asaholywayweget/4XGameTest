namespace EngineFramework.Simulation;

/// <summary>
/// Worker-scoped mutation submission context.
/// </summary>
public sealed class WorkerMutationContext
{
    public WorkerMutationContext(WorkerId workerId, ThreadLocalCommandBuffer commandBuffer)
    {
        if (workerId != commandBuffer.WorkerId)
            throw new InvalidOperationException("WorkerMutationContext worker id must match the command buffer worker id.");

        WorkerId = workerId;
        CommandBuffer = commandBuffer;
    }

    public WorkerId WorkerId { get; }

    public ThreadLocalCommandBuffer CommandBuffer { get; }
}
