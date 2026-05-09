namespace EngineFramework.Simulation;

/// <summary>
/// Runtime frame stages. These are coarser than SimulationPhase and define frame orchestration.
/// </summary>
public enum ExecutionStageType
{
    BeginFrame,
    Input,
    Commands,
    Simulation,
    MutationBarrier,
    Snapshot,
    EndFrame
}
