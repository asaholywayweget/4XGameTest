namespace EngineFramework.Simulation;

/// <summary>
/// Stable simulation entity identifier.
/// </summary>
public readonly record struct EntityId(long Value)
{
    public static EntityId Invalid { get; } = new(0);

    public bool IsValid => Value > 0;

    public override string ToString() => Value.ToString();
}
