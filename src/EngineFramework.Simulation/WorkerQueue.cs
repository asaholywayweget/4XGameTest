namespace EngineFramework.Simulation;

/// <summary>
/// Deterministic FIFO job queue. Future versions may dispatch to worker threads.
/// </summary>
public sealed class WorkerQueue
{
    private readonly Queue<(JobHandle Handle, Action Work)> _queue = new();

    public int Count => _queue.Count;

    public JobHandle Enqueue(string name, Action work)
    {
        var handle = new JobHandle(name);
        _queue.Enqueue((handle, work));
        return handle;
    }

    public IReadOnlyList<JobHandle> DrainSynchronously()
    {
        var handles = new List<JobHandle>();

        while (_queue.TryDequeue(out var item))
        {
            item.Handle.MarkRunning();
            try
            {
                item.Work();
                item.Handle.MarkCompleted();
            }
            catch (Exception ex)
            {
                item.Handle.MarkFailed(ex);
            }

            handles.Add(item.Handle);
        }

        return handles;
    }
}
