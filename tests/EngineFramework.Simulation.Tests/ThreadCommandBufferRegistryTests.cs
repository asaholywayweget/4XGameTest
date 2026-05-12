using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ThreadCommandBufferRegistryTests
{
    [Fact]
    public void Buffers_ReturnsStableWorkerOrdering()
    {
        var registry = new ThreadCommandBufferRegistry();

        registry.GetOrCreate(new WorkerId(5));
        registry.GetOrCreate(new WorkerId(1));
        registry.GetOrCreate(new WorkerId(3));

        var ordered = registry.Buffers;

        Assert.Equal(1, ordered[0].WorkerId.Value);
        Assert.Equal(3, ordered[1].WorkerId.Value);
        Assert.Equal(5, ordered[2].WorkerId.Value);
    }
}
