using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ConflictFreeBatchGroupTests
{
    [Fact]
    public void Constructor_PreservesBatchCollection()
    {
        var batchA = new ScheduledSystemBatch(0, Array.Empty<IScheduledSimulationSystem>());
        var batchB = new ScheduledSystemBatch(1, Array.Empty<IScheduledSimulationSystem>());

        var group = new ConflictFreeBatchGroup(new[] { batchA, batchB });

        Assert.Equal(2, group.Batches.Count);
        Assert.Equal(0, group.Batches[0].Index);
        Assert.Equal(1, group.Batches[1].Index);
    }
}
