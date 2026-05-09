using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class RuntimePipelineTests
{
    [Fact]
    public void Build_OrdersStagesByStageTypeThenName()
    {
        var pipeline = new RuntimePipelineBuilder()
            .Add(new NoOpRuntimeStage(ExecutionStageType.Snapshot, "b"))
            .Add(new NoOpRuntimeStage(ExecutionStageType.BeginFrame, "a"))
            .Build();

        Assert.Equal(ExecutionStageType.BeginFrame, pipeline.Stages[0].StageType);
        Assert.Equal(ExecutionStageType.Snapshot, pipeline.Stages[1].StageType);
    }
}
