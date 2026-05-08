namespace EngineFramework.Core;

/// <summary>
/// Stable engine-level identifier.
/// This type is intentionally small and dependency-free.
/// </summary>
public readonly record struct EngineId(Guid Value)
{
    public static EngineId New() => new(Guid.NewGuid());

    public static EngineId Empty { get; } = new(Guid.Empty);

    public bool IsEmpty => Value == Guid.Empty;

    public override string ToString() => Value.ToString("N");
}
