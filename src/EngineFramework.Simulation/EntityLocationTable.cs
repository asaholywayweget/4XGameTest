namespace EngineFramework.Simulation;

/// <summary>
/// Maps entity ids to their physical chunk location.
/// </summary>
public sealed class EntityLocationTable
{
    private readonly Dictionary<EntityId, ChunkCursor> _locations = new();

    public int Count => _locations.Count;

    public void Set(EntityId entityId, ChunkCursor cursor)
    {
        if (!entityId.IsValid)
            throw new ArgumentException("EntityId must be valid.", nameof(entityId));

        if (!cursor.IsValid)
            throw new ArgumentException("ChunkCursor must be valid.", nameof(cursor));

        _locations[entityId] = cursor;
    }

    public bool TryGet(EntityId entityId, out ChunkCursor cursor)
    {
        return _locations.TryGetValue(entityId, out cursor);
    }

    public bool Remove(EntityId entityId)
    {
        return _locations.Remove(entityId);
    }
}
