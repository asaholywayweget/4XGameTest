namespace EngineFramework.Simulation;

public interface IRuntimeStage
{
    ExecutionStageType StageType { get; }

    string Name { get; }

    void Execute(RuntimeTickContext context);
}
