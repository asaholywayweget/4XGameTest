namespace EngineFramework.Simulation;

public readonly record struct ArchetypeId(string Value)
{
    public bool IsEmpty => string.IsNullOrWhiteSpace(Value);

    public override string ToString() => Value;
}
