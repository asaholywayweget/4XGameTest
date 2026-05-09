namespace EngineFramework.Simulation;

/// <summary>
/// Stable cursor into chunk storage for future entity lookup tables.
/// </summary>
public readonly record struct ChunkCursor(ArchetypeId ArchetypeId, int ChunkIndex, int RowIndex)
{
    public bool IsValid => !ArchetypeId.IsEmpty && ChunkIndex >= 0 && RowIndex >= 0;
}
