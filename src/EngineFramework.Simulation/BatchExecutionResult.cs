namespace EngineFramework.Simulation;

public sealed record BatchExecutionResult(
    int BatchCount,
    int CompletedJobs,
    int FailedJobs,
    IReadOnlyList<JobHandle> Handles)
{
    public bool Success => FailedJobs == 0;
}
