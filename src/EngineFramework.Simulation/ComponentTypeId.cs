namespace EngineFramework.Simulation;

/// <summary>
/// Stable runtime identifier for a component type.
/// </summary>
public readonly record struct ComponentTypeId(string Value)
{
    public bool IsEmpty => string.IsNullOrWhiteSpace(Value);

    public override string ToString() => Value;

    public static ComponentTypeId From<T>() where T : IComponent => new(typeof(T).FullName ?? typeof(T).Name);
}
