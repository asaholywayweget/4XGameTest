using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class SimulationRuntimeTests
{
    [Fact]
    public void Tick_AdvancesClockAndCapturesSnapshot()
    {
        var world = new SimulationWorld();
        var scheduler = new SystemScheduler();
        var schedule = scheduler.Build(Array.Empty<IScheduledSimulationSystem>());
        var pipeline = DefaultRuntimePipelineFactory.Create(schedule);
        var runtime = new SimulationRuntime(world, new FixedStepClock(0.25), pipeline);

        var context = runtime.Tick(0.25);

        Assert.Equal(1, context.Time.Tick.Value);
        Assert.NotNull(context.Snapshot);
        Assert.Equal(0, context.Snapshot.Value.EntityCount);
    }

    [Fact]
    public void Tick_AppliesBufferedStructuralCommandsBeforeSnapshot()
    {
        var world = new SimulationWorld();
        var scheduler = new SystemScheduler();
        var schedule = scheduler.Build(Array.Empty<IScheduledSimulationSystem>());
        var pipeline = DefaultRuntimePipelineFactory.Create(schedule);
        var runtime = new SimulationRuntime(world, new FixedStepClock(0.25), pipeline);

        runtime.CommandBuffer.CreateEntity(new EngineTick(1));
        var context = runtime.Tick(0.25);

        Assert.Equal(1, context.MutationResult?.AppliedCount);
        Assert.Equal(1, context.Snapshot?.EntityCount);
    }
}
