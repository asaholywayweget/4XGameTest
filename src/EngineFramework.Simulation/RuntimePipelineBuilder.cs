namespace EngineFramework.Simulation;

public sealed class RuntimePipelineBuilder
{
    private readonly List<IRuntimeStage> _stages = new();

    public RuntimePipelineBuilder Add(IRuntimeStage stage)
    {
        _stages.Add(stage);
        return this;
    }

    public RuntimePipeline Build()
    {
        var ordered = _stages
            .OrderBy(stage => stage.StageType)
            .ThenBy(stage => stage.Name, StringComparer.Ordinal)
            .ToArray();

        return new RuntimePipeline(ordered);
    }
}
