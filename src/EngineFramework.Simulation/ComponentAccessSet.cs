namespace EngineFramework.Simulation;

public sealed class ComponentAccessSet
{
    private readonly ComponentAccess[] _accesses;

    public ComponentAccessSet(IEnumerable<ComponentAccess> accesses)
    {
        _accesses = accesses
            .Where(access => !access.ComponentType.IsEmpty)
            .GroupBy(access => access.ComponentType)
            .Select(group => group.Any(access => access.Mode == ComponentAccessMode.ReadWrite)
                ? new ComponentAccess(group.Key, ComponentAccessMode.ReadWrite)
                : new ComponentAccess(group.Key, ComponentAccessMode.ReadOnly))
            .OrderBy(access => access.ComponentType.Value, StringComparer.Ordinal)
            .ToArray();
    }

    public IReadOnlyList<ComponentAccess> Accesses => _accesses;

    public IReadOnlyList<ComponentTypeId> RequiredTypes => _accesses.Select(access => access.ComponentType).ToArray();

    public bool ConflictsWith(ComponentAccessSet other)
    {
        foreach (var access in _accesses)
        {
            foreach (var otherAccess in other._accesses)
            {
                if (access.ComponentType != otherAccess.ComponentType)
                    continue;

                if (access.Mode == ComponentAccessMode.ReadWrite || otherAccess.Mode == ComponentAccessMode.ReadWrite)
                    return true;
            }
        }

        return false;
    }
}
