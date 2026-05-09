namespace EngineFramework.Simulation;

public sealed record SimulationSystemDescriptor
{
    public required SimulationSystemId Id { get; init; }

    public required SimulationPhase Phase { get; init; }

    public int Order { get; init; }

    public IReadOnlyList<SimulationSystemId> DependsOn { get; init; } = Array.Empty<SimulationSystemId>();

    public void Validate()
    {
        if (Id.IsEmpty)
            throw new InvalidOperationException("Simulation system id cannot be empty.");

        if (DependsOn.Any(dependency => dependency.IsEmpty))
            throw new InvalidOperationException("System dependencies cannot contain empty ids.");

        if (DependsOn.Contains(Id))
            throw new InvalidOperationException("Simulation system cannot depend on itself.");
    }
}
