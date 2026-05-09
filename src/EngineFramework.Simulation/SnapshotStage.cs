namespace EngineFramework.Simulation;

public sealed class SnapshotStage : IRuntimeStage
{
    public ExecutionStageType StageType => ExecutionStageType.Snapshot;

    public string Name => "Snapshot";

    public void Execute(RuntimeTickContext context)
    {
        context.Snapshot = context.World.CreateSnapshot(context.Time.Tick);
    }
}
