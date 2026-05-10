namespace EngineFramework.Simulation;

public sealed record ArchetypeMigrationResult(
    bool Success,
    EntityId EntityId,
    ArchetypeTransition? Transition,
    string? Warning)
{
    public static ArchetypeMigrationResult Failed(EntityId entityId, string warning) => new(false, entityId, null, warning);

    public static ArchetypeMigrationResult Completed(EntityId entityId, ArchetypeTransition transition) => new(true, entityId, transition, null);
}
