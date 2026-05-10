namespace EngineFramework.Simulation;

/// <summary>
/// Minimal replay command ingestion stage.
/// v0.1 supports built-in create_entity command for deterministic smoke tests.
/// </summary>
public sealed class ReplayCommandIngestionStage : IRuntimeStage
{
    private readonly ReplayInputStream _stream;

    public ReplayCommandIngestionStage(ReplayInputStream stream)
    {
        _stream = stream;
    }

    public ExecutionStageType StageType => ExecutionStageType.Commands;

    public string Name => "ReplayCommandIngestion";

    public void Execute(RuntimeTickContext context)
    {
        foreach (var command in _stream.CommandsForTick(context.Time.Tick))
        {
            if (string.Equals(command.Type, "create_entity", StringComparison.Ordinal))
                context.CommandBuffer.CreateEntity(context.Time.Tick);
        }
    }
}
