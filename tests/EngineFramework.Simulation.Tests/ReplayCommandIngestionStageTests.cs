using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ReplayCommandIngestionStageTests
{
    [Fact]
    public void Execute_RecordsCreateEntityCommandForCurrentTick()
    {
        var stream = new ReplayInputStream(new[]
        {
            new RecordedCommand(new EngineTick(1), "create_entity", new Dictionary<string, string>())
        });
        var stage = new ReplayCommandIngestionStage(stream);
        var context = new RuntimeTickContext(
            new SimulationWorld(),
            EngineTime.Zero.Advance(0.1),
            new DeferredCommandBuffer(),
            new MutationBarrier());

        stage.Execute(context);

        Assert.Equal(1, context.CommandBuffer.Count);
    }
}
