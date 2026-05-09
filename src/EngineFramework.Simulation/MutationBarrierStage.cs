namespace EngineFramework.Simulation;

public sealed class MutationBarrierStage : IRuntimeStage
{
    public ExecutionStageType StageType => ExecutionStageType.MutationBarrier;

    public string Name => "MutationBarrier";

    public void Execute(RuntimeTickContext context)
    {
        context.MutationResult = context.MutationBarrier.Flush(context.World, context.CommandBuffer);
    }
}
