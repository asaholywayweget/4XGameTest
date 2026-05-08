namespace EngineFramework.Space;

/// <summary>
/// Stable identifier for spatial scale layers.
/// </summary>
public readonly record struct SpatialLayerId(string Value)
{
    public static SpatialLayerId Root { get; } = new("root");

    public bool IsEmpty => string.IsNullOrWhiteSpace(Value);

    public override string ToString() => Value;
}
