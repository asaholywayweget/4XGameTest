namespace EngineFramework.Simulation;

public sealed record ArchetypeMigrationPlan(
    EntityId EntityId,
    ArchetypeSignature SourceSignature,
    ArchetypeSignature TargetSignature,
    ArchetypeTransition Transition);
