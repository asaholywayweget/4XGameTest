namespace EngineFramework.Simulation;

/// <summary>
/// Access declaration attached to a scheduled system for future job batching.
/// </summary>
public sealed record SystemAccessDescriptor
{
    public required SimulationSystemId SystemId { get; init; }

    public required SimulationPhase Phase { get; init; }

    public required ComponentAccessSet AccessSet { get; init; }
}
