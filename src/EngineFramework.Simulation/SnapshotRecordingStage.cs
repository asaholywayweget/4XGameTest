namespace EngineFramework.Simulation;

public sealed class SnapshotRecordingStage : IRuntimeStage
{
    private readonly SnapshotRecorder _recorder;

    public SnapshotRecordingStage(SnapshotRecorder recorder)
    {
        _recorder = recorder;
    }

    public ExecutionStageType StageType => ExecutionStageType.Snapshot;

    public string Name => "SnapshotRecording";

    public void Execute(RuntimeTickContext context)
    {
        var frame = _recorder.Capture(context.World, context.Time.Tick);
        context.Snapshot = new SimulationSnapshot(context.Time.Tick, frame.EntityCount, DateTime.UtcNow);
    }
}
