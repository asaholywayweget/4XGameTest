namespace EngineFramework.Simulation;

public sealed class NoOpRuntimeStage : IRuntimeStage
{
    public NoOpRuntimeStage(ExecutionStageType stageType, string name)
    {
        StageType = stageType;
        Name = name;
    }

    public ExecutionStageType StageType { get; }

    public string Name { get; }

    public void Execute(RuntimeTickContext context)
    {
    }
}
