namespace EngineFramework.Simulation;

/// <summary>
/// Lightweight index record for locating an entity in future storage backends.
/// </summary>
public readonly record struct EntityRecord(
    EntityId EntityId,
    ArchetypeId ArchetypeId,
    int RowIndex);
