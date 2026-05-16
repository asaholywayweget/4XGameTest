using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ParallelExecutionPlanTests
{
    [Fact]
    public void TotalBatchCount_SumsWaveBatchCounts()
    {
        var waveA = new ExecutionWave(0, new[]
        {
            new ScheduledSystemBatch(0, Array.Empty<IScheduledSimulationSystem>())
        });

        var waveB = new ExecutionWave(1, new[]
        {
            new ScheduledSystemBatch(1, Array.Empty<IScheduledSimulationSystem>()),
            new ScheduledSystemBatch(2, Array.Empty<IScheduledSimulationSystem>())
        });

        var plan = new ParallelExecutionPlan(new[] { waveA, waveB });

        Assert.Equal(3, plan.TotalBatchCount);
    }
}
