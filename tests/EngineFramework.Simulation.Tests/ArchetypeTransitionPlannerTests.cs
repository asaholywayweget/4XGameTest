using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ArchetypeTransitionPlannerTests
{
    [Fact]
    public void PlanAdd_CreatesTargetSignatureWithComponent()
    {
        var planner = new ArchetypeTransitionPlanner();
        var source = new ArchetypeSignature(new[] { new ComponentTypeId("A") });

        var transition = planner.PlanAdd(source, new ComponentTypeId("B"));

        Assert.Equal(source.Id, transition.Source);
        Assert.Equal("A|B", transition.Target.Value);
        Assert.Equal(ArchetypeTransitionKind.AddComponent, transition.Kind);
    }

    [Fact]
    public void PlanRemove_CreatesTargetSignatureWithoutComponent()
    {
        var planner = new ArchetypeTransitionPlanner();
        var source = new ArchetypeSignature(new[] { new ComponentTypeId("A"), new ComponentTypeId("B") });

        var transition = planner.PlanRemove(source, new ComponentTypeId("B"));

        Assert.Equal("A", transition.Target.Value);
        Assert.Equal(ArchetypeTransitionKind.RemoveComponent, transition.Kind);
    }
}
