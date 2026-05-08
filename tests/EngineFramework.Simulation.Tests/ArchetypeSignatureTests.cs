using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ArchetypeSignatureTests
{
    [Fact]
    public void Constructor_SortsAndDeduplicatesComponentTypes()
    {
        var signature = new ArchetypeSignature(new[]
        {
            new ComponentTypeId("B"),
            new ComponentTypeId("A"),
            new ComponentTypeId("A")
        });

        Assert.Equal("A|B", signature.Id.Value);
        Assert.Equal(2, signature.ComponentTypes.Count);
    }

    [Fact]
    public void ContainsAll_ReturnsTrueWhenAllTypesExist()
    {
        var signature = new ArchetypeSignature(new[]
        {
            new ComponentTypeId("A"),
            new ComponentTypeId("B")
        });

        Assert.True(signature.ContainsAll(new[] { new ComponentTypeId("A") }));
    }
}
