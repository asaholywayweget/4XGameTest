using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class CommandBufferMergerTests
{
    [Fact]
    public void Merge_UsesDeterministicWorkerOrdering()
    {
        var registry = new ThreadCommandBufferRegistry();
        var workerB = registry.GetOrCreate(new WorkerId(2));
        var workerA = registry.GetOrCreate(new WorkerId(1));

        workerB.Buffer.CreateEntity(new EngineTick(2));
        workerA.Buffer.CreateEntity(new EngineTick(1));

        var target = new DeferredCommandBuffer();
        var merger = new CommandBufferMerger();

        var result = merger.Merge(registry.Buffers, target);

        Assert.Equal(2, result.SourceBuffers);
        Assert.Equal(2, result.MergedCommands);
        Assert.Equal(1, target.Commands[0].Tick.Value);
        Assert.Equal(2, target.Commands[1].Tick.Value);
    }
}
