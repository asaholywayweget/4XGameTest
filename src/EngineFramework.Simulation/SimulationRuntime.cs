using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Orchestrates one deterministic simulation runtime pipeline.
/// </summary>
public sealed class SimulationRuntime
{
    private readonly IEngineClock _clock;
    private readonly RuntimePipeline _pipeline;

    public SimulationRuntime(
        SimulationWorld world,
        IEngineClock clock,
        RuntimePipeline pipeline,
        DeferredCommandBuffer? commandBuffer = null,
        MutationBarrier? mutationBarrier = null)
    {
        World = world;
        _clock = clock;
        _pipeline = pipeline;
        CommandBuffer = commandBuffer ?? new DeferredCommandBuffer();
        MutationBarrier = mutationBarrier ?? new MutationBarrier();
    }

    public SimulationWorld World { get; }

    public DeferredCommandBuffer CommandBuffer { get; }

    public MutationBarrier MutationBarrier { get; }

    public EngineTime CurrentTime => _clock.Current;

    public RuntimeTickContext Tick(double deltaSeconds)
    {
        var time = _clock.Advance(deltaSeconds);
        var context = new RuntimeTickContext(World, time, CommandBuffer, MutationBarrier);
        _pipeline.Execute(context);
        return context;
    }
}
