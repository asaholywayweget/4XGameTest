using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class WorkerQueueTests
{
    [Fact]
    public void DrainSynchronously_CompletesQueuedJobsInOrder()
    {
        var queue = new WorkerQueue();
        var values = new List<int>();

        queue.Enqueue("a", () => values.Add(1));
        queue.Enqueue("b", () => values.Add(2));

        var handles = queue.DrainSynchronously();

        Assert.Equal(new[] { 1, 2 }, values.ToArray());
        Assert.Equal(2, handles.Count);
        Assert.All(handles, handle => Assert.Equal(JobStatus.Completed, handle.Status));
    }

    [Fact]
    public void DrainSynchronously_MarksFailedJobs()
    {
        var queue = new WorkerQueue();
        queue.Enqueue("fail", () => throw new InvalidOperationException("boom"));

        var handles = queue.DrainSynchronously();

        Assert.Single(handles);
        Assert.Equal(JobStatus.Failed, handles[0].Status);
        Assert.NotNull(handles[0].Error);
    }
}
