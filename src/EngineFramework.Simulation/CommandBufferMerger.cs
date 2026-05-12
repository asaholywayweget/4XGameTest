namespace EngineFramework.Simulation;

/// <summary>
/// Merges thread-local command buffers into one deterministic command stream.
/// </summary>
public sealed class CommandBufferMerger
{
    private readonly DeterministicMergePolicy _policy;

    public CommandBufferMerger(DeterministicMergePolicy? policy = null)
    {
        _policy = policy ?? new DeterministicMergePolicy();
    }

    public CommandBufferMergeResult Merge(
        IEnumerable<ThreadLocalCommandBuffer> sources,
        DeferredCommandBuffer target)
    {
        var ordered = _policy.Order(sources);
        var merged = 0;

        foreach (var source in ordered)
        {
            foreach (var command in source.Buffer.Commands)
            {
                target.Enqueue(command);
                merged++;
            }
        }

        return new CommandBufferMergeResult(ordered.Count, merged);
    }
}
