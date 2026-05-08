using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ArchetypeRegistryTests
{
    [Fact]
    public void GetOrCreate_ReusesSameStorageForSameSignature()
    {
        var registry = new ArchetypeRegistry();
        var signature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });

        var first = registry.GetOrCreate(signature);
        var second = registry.GetOrCreate(signature);

        Assert.Same(first, second);
    }

    [Fact]
    public void Query_ReturnsMatchingStorages()
    {
        var registry = new ArchetypeRegistry();
        var a = registry.GetOrCreate(new ArchetypeSignature(new[] { new ComponentTypeId("A") }));
        registry.GetOrCreate(new ArchetypeSignature(new[] { new ComponentTypeId("B") }));

        var result = registry.Query(new SimulationQuery(new[] { new ComponentTypeId("A") })).ToArray();

        Assert.Single(result);
        Assert.Same(a, result[0]);
    }
}
