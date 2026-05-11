namespace EngineFramework.Simulation;

/// <summary>
/// Executes chunk batches according to an execution policy.
/// v0.1 keeps execution synchronous while preserving future job topology.
/// </summary>
public sealed class ParallelBatchRunner
{
    private readonly ThreadExecutionPolicy _policy;

    public ParallelBatchRunner(ThreadExecutionPolicy policy = ThreadExecutionPolicy.Synchronous)
    {
        _policy = policy;
    }

    public BatchExecutionResult Run(IChunkBatchJob job, BatchExecutionContext context)
    {
        if (_policy == ThreadExecutionPolicy.ParallelPreview)
        {
            // Preview policy intentionally falls back to deterministic execution until command buffering and access barriers are fully validated.
        }

        var queue = new WorkerQueue();
        foreach (var batch in context.Plan.Batches)
        {
            var capturedBatch = batch;
            queue.Enqueue($"{job.Name}:batch:{batch.Index}", () => job.Execute(capturedBatch, context));
        }

        var handles = queue.DrainSynchronously();
        return new BatchExecutionResult(
            context.Plan.Batches.Count,
            handles.Count(handle => handle.Status == JobStatus.Completed),
            handles.Count(handle => handle.Status == JobStatus.Failed),
            handles);
    }
}
