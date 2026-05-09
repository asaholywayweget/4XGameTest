using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class SystemAccessAnalyzerTests
{
    [Fact]
    public void BuildConflictGraph_DetectsWriteConflictInSamePhase()
    {
        var analyzer = new SystemAccessAnalyzer();
        var descriptors = new[]
        {
            Descriptor("a", ComponentAccessMode.ReadOnly),
            Descriptor("b", ComponentAccessMode.ReadWrite)
        };

        var graph = analyzer.BuildConflictGraph(descriptors);

        Assert.True(graph.HasConflict(new SimulationSystemId("a"), new SimulationSystemId("b")));
    }

    [Fact]
    public void BuildConflictGraph_IgnoresReadReadInSamePhase()
    {
        var analyzer = new SystemAccessAnalyzer();
        var descriptors = new[]
        {
            Descriptor("a", ComponentAccessMode.ReadOnly),
            Descriptor("b", ComponentAccessMode.ReadOnly)
        };

        var graph = analyzer.BuildConflictGraph(descriptors);

        Assert.Empty(graph.Conflicts);
    }

    private static SystemAccessDescriptor Descriptor(string id, ComponentAccessMode mode)
    {
        return new SystemAccessDescriptor
        {
            SystemId = new SimulationSystemId(id),
            Phase = SimulationPhase.Simulation,
            AccessSet = new ComponentAccessSet(new[]
            {
                new ComponentAccess(new ComponentTypeId("Position"), mode)
            })
        };
    }
}
