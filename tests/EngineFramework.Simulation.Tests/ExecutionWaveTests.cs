using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ExecutionWaveTests
{
    [Fact]
    public void Constructor_PreservesBatchOrdering()
    {
        var batchA = new ScheduledSystemBatch(0, Array.Empty<IScheduledSimulationSystem>());
        var batchB = new ScheduledSystemBatch(1, Array.Empty<IScheduledSimulationSystem>());

        var wave = new ExecutionWave(2, new[] { batchA, batchB });

        Assert.Equal(2, wave.Index);
        Assert.Equal(0, wave.Batches[0].Index);
        Assert.Equal(1, wave.Batches[1].Index);
    }
}
