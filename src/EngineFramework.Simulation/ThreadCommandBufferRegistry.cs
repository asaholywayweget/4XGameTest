namespace EngineFramework.Simulation;

/// <summary>
/// Stores thread-local command buffers by worker id.
/// </summary>
public sealed class ThreadCommandBufferRegistry
{
    private readonly Dictionary<WorkerId, ThreadLocalCommandBuffer> _buffers = new();

    public int Count => _buffers.Count;

    public ThreadLocalCommandBuffer GetOrCreate(WorkerId workerId)
    {
        if (_buffers.TryGetValue(workerId, out var existing))
            return existing;

        var created = new ThreadLocalCommandBuffer(workerId);
        _buffers.Add(workerId, created);
        return created;
    }

    public IReadOnlyList<ThreadLocalCommandBuffer> Buffers => _buffers.Values
        .OrderBy(buffer => buffer.WorkerId.Value)
        .ToArray();
}
