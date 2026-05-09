using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ExecutionPlanBuilderTests
{
    [Fact]
    public void Build_GroupsReadOnlySystemsIntoSameBatch()
    {
        var builder = new ExecutionPlanBuilder();
        var plan = builder.Build(new[]
        {
            Descriptor("a", ComponentAccessMode.ReadOnly),
            Descriptor("b", ComponentAccessMode.ReadOnly)
        });

        Assert.Single(plan.Batches);
        Assert.Equal(new[] { new SimulationSystemId("a"), new SimulationSystemId("b") }, plan.Batches[0].Systems.ToArray());
    }

    [Fact]
    public void Build_SplitsConflictingSystemsIntoSeparateBatches()
    {
        var builder = new ExecutionPlanBuilder();
        var plan = builder.Build(new[]
        {
            Descriptor("a", ComponentAccessMode.ReadWrite),
            Descriptor("b", ComponentAccessMode.ReadOnly)
        });

        Assert.Equal(2, plan.Batches.Count);
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
