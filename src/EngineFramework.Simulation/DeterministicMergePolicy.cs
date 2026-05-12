namespace EngineFramework.Simulation;

/// <summary>
/// Defines deterministic ordering for merging worker command buffers.
/// </summary>
public sealed class DeterministicMergePolicy
{
    public IReadOnlyList<ThreadLocalCommandBuffer> Order(IEnumerable<ThreadLocalCommandBuffer> buffers)
    {
        return buffers
            .OrderBy(buffer => buffer.WorkerId.Value)
            .ToArray();
    }
}
