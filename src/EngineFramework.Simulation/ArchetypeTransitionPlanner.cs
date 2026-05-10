namespace EngineFramework.Simulation;

public sealed class ArchetypeTransitionPlanner
{
    public ArchetypeTransition PlanAdd(ArchetypeSignature source, ComponentTypeId componentType)
    {
        if (componentType.IsEmpty)
            throw new ArgumentException("Component type cannot be empty.", nameof(componentType));

        var targetTypes = source.ComponentTypes
            .Append(componentType)
            .ToArray();

        var target = new ArchetypeSignature(targetTypes);

        return new ArchetypeTransition(
            source.Id,
            target.Id,
            componentType,
            ArchetypeTransitionKind.AddComponent);
    }

    public ArchetypeTransition PlanRemove(ArchetypeSignature source, ComponentTypeId componentType)
    {
        if (componentType.IsEmpty)
            throw new ArgumentException("Component type cannot be empty.", nameof(componentType));

        var targetTypes = source.ComponentTypes
            .Where(type => type != componentType)
            .ToArray();

        var target = new ArchetypeSignature(targetTypes);

        return new ArchetypeTransition(
            source.Id,
            target.Id,
            componentType,
            ArchetypeTransitionKind.RemoveComponent);
    }
}
