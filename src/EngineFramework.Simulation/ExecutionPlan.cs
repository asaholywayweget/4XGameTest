namespace EngineFramework.Simulation;

public sealed class ExecutionPlan
{
    private readonly ExecutionBatch[] _batches;

    public ExecutionPlan(IEnumerable<ExecutionBatch> batches)
    {
        _batches = batches.ToArray();
    }

    public IReadOnlyList<ExecutionBatch> Batches => _batches;
}
