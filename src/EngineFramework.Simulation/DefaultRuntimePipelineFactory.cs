namespace EngineFramework.Simulation;

public static class DefaultRuntimePipelineFactory
{
    public static RuntimePipeline Create(SimulationSchedule schedule)
    {
        return new RuntimePipelineBuilder()
            .Add(new NoOpRuntimeStage(ExecutionStageType.BeginFrame, "BeginFrame"))
            .Add(new NoOpRuntimeStage(ExecutionStageType.Input, "Input"))
            .Add(new NoOpRuntimeStage(ExecutionStageType.Commands, "Commands"))
            .Add(new SimulationStage(schedule))
            .Add(new MutationBarrierStage())
            .Add(new SnapshotStage())
            .Add(new NoOpRuntimeStage(ExecutionStageType.EndFrame, "EndFrame"))
            .Build();
    }
}
