using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class WorkerBatchAssignmentTests
{
    [Fact]
    public void Constructor_PreservesWorkerAndBatchTopology()
    {
        var batch = new ScheduledSystemBatch(4, Array.Empty<IScheduledSimulationSystem>());
        var assignment = new WorkerBatchAssignment(new WorkerId(3), 1, batch);

        Assert.Equal(3, assignment.WorkerId.Value);
        Assert.Equal(1, assignment.WaveIndex);
        Assert.Equal(4, assignment.Batch.Index);
    }
}
