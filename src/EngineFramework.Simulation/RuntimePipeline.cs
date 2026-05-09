namespace EngineFramework.Simulation;

public sealed class RuntimePipeline
{
    private readonly IRuntimeStage[] _stages;

    public RuntimePipeline(IEnumerable<IRuntimeStage> stages)
    {
        _stages = stages.ToArray();
    }

    public IReadOnlyList<IRuntimeStage> Stages => _stages;

    public void Execute(RuntimeTickContext context)
    {
        foreach (var stage in _stages)
            stage.Execute(context);
    }
}
