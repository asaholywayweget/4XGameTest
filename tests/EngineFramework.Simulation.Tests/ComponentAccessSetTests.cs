using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ComponentAccessSetTests
{
    [Fact]
    public void ConflictsWith_ReturnsFalseForReadRead()
    {
        var a = new ComponentAccessSet(new[] { new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadOnly) });
        var b = new ComponentAccessSet(new[] { new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadOnly) });

        Assert.False(a.ConflictsWith(b));
    }

    [Fact]
    public void ConflictsWith_ReturnsTrueForReadWrite()
    {
        var a = new ComponentAccessSet(new[] { new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadOnly) });
        var b = new ComponentAccessSet(new[] { new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadWrite) });

        Assert.True(a.ConflictsWith(b));
    }

    [Fact]
    public void Constructor_MergesDuplicateAccessesToWrite()
    {
        var set = new ComponentAccessSet(new[]
        {
            new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadOnly),
            new ComponentAccess(new ComponentTypeId("A"), ComponentAccessMode.ReadWrite)
        });

        Assert.Single(set.Accesses);
        Assert.Equal(ComponentAccessMode.ReadWrite, set.Accesses[0].Mode);
    }
}
