using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class MutationBarrierTests
{
    [Fact]
    public void Flush_AppliesCreateEntityCommands()
    {
        var world = new SimulationWorld();
        var buffer = new DeferredCommandBuffer();
        var barrier = new MutationBarrier();

        buffer.CreateEntity(new EngineTick(1));
        buffer.CreateEntity(new EngineTick(2));

        var result = barrier.Flush(world, buffer);

        Assert.Equal(2, result.AppliedCount);
        Assert.Equal(2, world.Entities.Count);
        Assert.Equal(0, buffer.Count);
    }

    [Fact]
    public void Flush_AppliesDestroyEntityCommands()
    {
        var world = new SimulationWorld();
        var entity = world.CreateEntity();
        var buffer = new DeferredCommandBuffer();
        var barrier = new MutationBarrier();

        buffer.DestroyEntity(new EngineTick(1), entity.Id);

        var result = barrier.Flush(world, buffer);

        Assert.Equal(1, result.AppliedCount);
        Assert.Empty(world.Entities);
    }
}
