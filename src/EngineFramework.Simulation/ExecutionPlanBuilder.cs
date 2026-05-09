namespace EngineFramework.Simulation;

/// <summary>
/// Builds deterministic batches of non-conflicting systems.
/// This is not a runtime job scheduler yet.
/// </summary>
public sealed class ExecutionPlanBuilder
{
    private readonly SystemAccessAnalyzer _analyzer = new();

    public ExecutionPlan Build(IEnumerable<SystemAccessDescriptor> descriptors)
    {
        var ordered = descriptors
            .OrderBy(descriptor => descriptor.Phase)
            .ThenBy(descriptor => descriptor.SystemId.Value, StringComparer.Ordinal)
            .ToArray();

        var graph = _analyzer.BuildConflictGraph(ordered);
        var batches = new List<ExecutionBatch>();

        foreach (var phaseGroup in ordered.GroupBy(descriptor => descriptor.Phase).OrderBy(group => group.Key))
        {
            var phaseBatches = new List<ExecutionBatch>();

            foreach (var descriptor in phaseGroup)
            {
                var target = phaseBatches.FirstOrDefault(batch =>
                    batch.Systems.All(existing => !graph.HasConflict(existing, descriptor.SystemId)));

                if (target is null)
                {
                    target = new ExecutionBatch(descriptor.Phase, phaseBatches.Count);
                    phaseBatches.Add(target);
                }

                target.Add(descriptor.SystemId);
            }

            batches.AddRange(phaseBatches);
        }

        return new ExecutionPlan(batches);
    }
}
