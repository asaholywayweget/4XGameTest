using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkQueryCacheTests
{
    [Fact]
    public void GetOrAdd_ReusesCachedQuery()
    {
        var cache = new ChunkQueryCache();

        var first = cache.GetOrAdd("read-test", ChunkQuery.Read<TestComponent>);
        var second = cache.GetOrAdd("read-test", ChunkQuery.Write<TestComponent>);

        Assert.Same(first, second);
        Assert.Equal(1, cache.Count);
        Assert.Equal(ComponentAccessMode.ReadOnly, first.Query.AccessSet.Accesses[0].Mode);
    }

    private readonly record struct TestComponent(int Value) : IComponent;
}
