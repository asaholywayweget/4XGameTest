using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class SnapshotRecorderTests
{
    [Fact]
    public void Capture_RecordsEntityCountAndHash()
    {
        var world = new SimulationWorld();
        world.CreateEntity();
        var recorder = new SnapshotRecorder();

        var frame = recorder.Capture(world, new EngineTick(1));

        Assert.Equal(1, frame.Tick.Value);
        Assert.Equal(1, frame.EntityCount);
        Assert.False(string.IsNullOrWhiteSpace(frame.StateHash));
        Assert.Single(recorder.Frames);
    }

    [Fact]
    public void Hash_IsStableForSameEntityIds()
    {
        var a = new SimulationWorld();
        var b = new SimulationWorld();
        a.CreateEntity();
        b.CreateEntity();

        var hasher = new DefaultSnapshotHasher();

        Assert.Equal(hasher.Hash(a), hasher.Hash(b));
    }
}
