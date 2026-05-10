using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class SnapshotRecorder
{
    private readonly List<SnapshotFrame> _frames = new();
    private readonly ISnapshotHasher _hasher;

    public SnapshotRecorder(ISnapshotHasher? hasher = null)
    {
        _hasher = hasher ?? new DefaultSnapshotHasher();
    }

    public IReadOnlyList<SnapshotFrame> Frames => _frames;

    public SnapshotFrame Capture(SimulationWorld world, EngineTick tick)
    {
        var frame = new SnapshotFrame(
            tick,
            world.Entities.Count,
            _hasher.Hash(world));

        _frames.Add(frame);
        return frame;
    }

    public void Clear() => _frames.Clear();
}
