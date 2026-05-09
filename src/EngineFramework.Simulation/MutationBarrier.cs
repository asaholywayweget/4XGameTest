namespace EngineFramework.Simulation;

/// <summary>
/// Safe point where deferred structural mutations are applied.
/// </summary>
public sealed class MutationBarrier
{
    private readonly StructuralCommandPlayback _playback = new();

    public CommandPlaybackResult Flush(SimulationWorld world, DeferredCommandBuffer buffer)
    {
        var commands = buffer.Drain();
        return _playback.Playback(world, commands);
    }
}
