namespace EngineFramework.Simulation;

/// <summary>
/// Ordered component-type signature for grouping entities by data shape.
/// </summary>
public sealed class ArchetypeSignature
{
    private readonly ComponentTypeId[] _componentTypes;

    public ArchetypeSignature(IEnumerable<ComponentTypeId> componentTypes)
    {
        _componentTypes = componentTypes
            .Where(type => !type.IsEmpty)
            .Distinct()
            .OrderBy(type => type.Value, StringComparer.Ordinal)
            .ToArray();

        Id = new ArchetypeId(string.Join("|", _componentTypes.Select(type => type.Value)));
    }

    public ArchetypeId Id { get; }

    public IReadOnlyList<ComponentTypeId> ComponentTypes => _componentTypes;

    public bool Contains(ComponentTypeId type) => _componentTypes.Contains(type);

    public bool ContainsAll(IEnumerable<ComponentTypeId> types)
    {
        var set = _componentTypes.ToHashSet();
        return types.All(set.Contains);
    }
}
