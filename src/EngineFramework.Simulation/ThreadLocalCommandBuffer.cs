namespace EngineFramework.Simulation;

/// <summary>
/// Command buffer owned by one worker execution context.
/// </summary>
public sealed class ThreadLocalCommandBuffer
{
    public ThreadLocalCommandBuffer(WorkerId workerId)
    {
        if (!workerId.IsValid)
            throw new ArgumentException("WorkerId must be valid.", nameof(workerId));

        WorkerId = workerId;
        Buffer = new DeferredCommandBuffer();
    }

    public WorkerId WorkerId { get; }

    public DeferredCommandBuffer Buffer { get; }
}
