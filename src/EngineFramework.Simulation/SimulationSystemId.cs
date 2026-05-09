namespace EngineFramework.Simulation;

public readonly record struct SimulationSystemId(string Value)
{
    public bool IsEmpty => string.IsNullOrWhiteSpace(Value);

    public override string ToString() => Value;
}
