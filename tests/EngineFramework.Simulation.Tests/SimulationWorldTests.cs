using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class SimulationWorldTests
{
    [Fact]
    public void CreateEntity_AssignsStableIds()
    {
        var world = new SimulationWorld();

        var a = world.CreateEntity();
        var b = world.CreateEntity();

        Assert.Equal(1, a.Id.Value);
        Assert.Equal(2, b.Id.Value);
    }

    [Fact]
    public void Tick_InvokesRegisteredSystems()
    {
        var world = new SimulationWorld();
        var system = new CountingSystem();

        world.AddSystem(system);
        world.Tick(EngineTime.Zero.Advance(0.1));

        Assert.Equal(1, system.TickCount);
    }

    private sealed class CountingSystem : ISimulationSystem
    {
        public string Name => "CountingSystem";

        public int TickCount { get; private set; }

        public void Tick(SimulationWorld world, EngineTime time)
        {
            TickCount++;
        }
    }
}
