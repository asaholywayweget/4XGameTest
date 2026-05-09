using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class RuntimeTickContext
{
    public RuntimeTickContext(
        SimulationWorld world,
        EngineTime time,
        DeferredCommandBuffer commandBuffer,
        MutationBarrier mutationBarrier)
    {
        World = world;
        Time = time;
        CommandBuffer = commandBuffer;
        MutationBarrier = mutationBarrier;
    }

    public SimulationWorld World { get; }

    public EngineTime Time { get; }

    public DeferredCommandBuffer CommandBuffer { get; }

    public MutationBarrier MutationBarrier { get; }

    public SimulationSnapshot? Snapshot { get; set; }

    public CommandPlaybackResult? MutationResult { get; set; }
}
