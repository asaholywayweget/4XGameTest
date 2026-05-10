namespace EngineFramework.Simulation;

/// <summary>
/// Describes a logical archetype transition caused by adding or removing one component type.
/// </summary>
public sealed record ArchetypeTransition(
    ArchetypeId Source,
    ArchetypeId Target,
    ComponentTypeId ComponentType,
    ArchetypeTransitionKind Kind);
