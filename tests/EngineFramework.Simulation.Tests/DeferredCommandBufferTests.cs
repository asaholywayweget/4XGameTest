using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class DeferredCommandBufferTests
{
    [Fact]
    public void CreateEntity_RecordsCommand()
    {
        var buffer = new DeferredCommandBuffer();

        buffer.CreateEntity(new EngineTick(1));

        Assert.Equal(1, buffer.Count);
        Assert.Equal(StructuralCommandType.CreateEntity, buffer.Commands[0].Type);
    }

    [Fact]
    public void Drain_ReturnsCommandsAndClearsBuffer()
    {
        var buffer = new DeferredCommandBuffer();
        buffer.CreateEntity(new EngineTick(1));

        var commands = buffer.Drain();

        Assert.Single(commands);
        Assert.Equal(0, buffer.Count);
    }
}
