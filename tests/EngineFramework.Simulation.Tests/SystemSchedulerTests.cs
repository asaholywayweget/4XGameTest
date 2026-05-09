using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class SystemSchedulerTests
{
    [Fact]
    public void Build_OrdersByPhaseOrderAndId()
    {
        var scheduler = new SystemScheduler();
        var systems = new IScheduledSimulationSystem[]
        {
            new TestSystem("b", SimulationPhase.Simulation, 0),
            new TestSystem("a", SimulationPhase.Input, 0),
            new TestSystem("c", SimulationPhase.Simulation, -1)
        };

        var schedule = scheduler.Build(systems);

        Assert.Equal(new[] { "a", "c", "b" }, schedule.Systems.Select(system => system.Descriptor.Id.Value).ToArray());
    }

    [Fact]
    public void Validate_DetectsMissingDependency()
    {
        var scheduler = new SystemScheduler();
        var systems = new IScheduledSimulationSystem[]
        {
            new TestSystem("a", SimulationPhase.Simulation, 0, new SimulationSystemId("missing"))
        };

        var result = scheduler.Validate(systems);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("missing"));
    }

    [Fact]
    public void Validate_DetectsDependencyCycle()
    {
        var scheduler = new SystemScheduler();
        var systems = new IScheduledSimulationSystem[]
        {
            new TestSystem("a", SimulationPhase.Simulation, 0, new SimulationSystemId("b")),
            new TestSystem("b", SimulationPhase.Simulation, 0, new SimulationSystemId("a"))
        };

        var result = scheduler.Validate(systems);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("cycle"));
    }

    private sealed class TestSystem : IScheduledSimulationSystem
    {
        public TestSystem(string id, SimulationPhase phase, int order, params SimulationSystemId[] dependsOn)
        {
            Descriptor = new SimulationSystemDescriptor
            {
                Id = new SimulationSystemId(id),
                Phase = phase,
                Order = order,
                DependsOn = dependsOn
            };
        }

        public string Name => Descriptor.Id.Value;

        public SimulationSystemDescriptor Descriptor { get; }

        public void Tick(SimulationWorld world, EngineTime time)
        {
        }
    }
}
