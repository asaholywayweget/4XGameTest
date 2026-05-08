namespace EngineFramework.Simulation;

/// <summary>
/// Minimal component query descriptor.
/// </summary>
public sealed class SimulationQuery
{
    private readonly ComponentTypeId[] _required;

    public SimulationQuery(IEnumerable<ComponentTypeId> required)
    {
        _required = required
            .Where(type => !type.IsEmpty)
            .Distinct()
            .OrderBy(type => type.Value, StringComparer.Ordinal)
            .ToArray();
    }

    public IReadOnlyList<ComponentTypeId> Required => _required;

    public bool Matches(ArchetypeSignature signature) => signature.ContainsAll(_required);

    public static SimulationQuery With<T>() where T : IComponent => new[] { ComponentTypeId.From<T>() }.ToQuery();
}

public static class SimulationQueryExtensions
{
    public static SimulationQuery ToQuery(this IEnumerable<ComponentTypeId> required) => new(required);
}
