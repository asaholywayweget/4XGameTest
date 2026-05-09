namespace EngineFramework.Simulation;

public sealed class SimulationStage : IRuntimeStage
{
    public SimulationStage(SimulationSchedule schedule)
    {
        Schedule = schedule;
    }

    public ExecutionStageType StageType => ExecutionStageType.Simulation;

    public string Name => "Simulation";

    public SimulationSchedule Schedule { get; }

    public void Execute(RuntimeTickContext context)
    {
        var runner = new ScheduledSimulationWorldRunner(context.World, Schedule);
        runner.Tick(context.Time);
    }
}
