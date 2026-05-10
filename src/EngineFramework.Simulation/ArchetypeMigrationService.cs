namespace EngineFramework.Simulation;

/// <summary>
/// Coordinates archetype transition planning and chunk relocation.
/// v0.1 establishes topology only; typed component payload migration is deferred.
/// </summary>
public sealed class ArchetypeMigrationService
{
    private readonly ArchetypeTransitionPlanner _planner = new();
    private readonly ChunkRelocationService _relocation;

    public ArchetypeMigrationService(ChunkRelocationService relocation)
    {
        _relocation = relocation;
    }

    public ArchetypeMigrationResult AddComponent(EntityId entityId, ArchetypeSignature sourceSignature, ComponentTypeId componentType)
    {
        var transition = _planner.PlanAdd(sourceSignature, componentType);
        var targetSignature = new ArchetypeSignature(sourceSignature.ComponentTypes.Append(componentType));
        var relocation = _relocation.Relocate(entityId, targetSignature);

        return relocation.Success
            ? ArchetypeMigrationResult.Completed(entityId, transition)
            : ArchetypeMigrationResult.Failed(entityId, relocation.Warning ?? "Relocation failed.");
    }

    public ArchetypeMigrationResult RemoveComponent(EntityId entityId, ArchetypeSignature sourceSignature, ComponentTypeId componentType)
    {
        var transition = _planner.PlanRemove(sourceSignature, componentType);
        var targetSignature = new ArchetypeSignature(sourceSignature.ComponentTypes.Where(type => type != componentType));
        var relocation = _relocation.Relocate(entityId, targetSignature);

        return relocation.Success
            ? ArchetypeMigrationResult.Completed(entityId, transition)
            : ArchetypeMigrationResult.Failed(entityId, relocation.Warning ?? "Relocation failed.");
    }
}
