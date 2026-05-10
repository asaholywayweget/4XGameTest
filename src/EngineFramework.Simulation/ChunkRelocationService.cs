namespace EngineFramework.Simulation;

/// <summary>
/// Handles entity-row relocation between chunked archetype storages.
/// v0.1 relocates entity identity only. Component payload migration is deferred.
/// </summary>
public sealed class ChunkRelocationService
{
    private readonly ChunkedArchetypeRegistry _registry;
    private readonly EntityLocationTable _locations;

    public ChunkRelocationService(ChunkedArchetypeRegistry registry, EntityLocationTable locations)
    {
        _registry = registry;
        _locations = locations;
    }

    public ChunkRelocationResult Relocate(EntityId entityId, ArchetypeSignature targetSignature)
    {
        if (!_locations.TryGet(entityId, out var sourceCursor))
            return ChunkRelocationResult.Failed($"Entity location not found: {entityId}");

        var sourceStorage = FindStorage(sourceCursor.ArchetypeId);
        if (sourceStorage is null)
            return ChunkRelocationResult.Failed($"Source archetype storage not found: {sourceCursor.ArchetypeId}");

        var sourceChunk = sourceStorage.GetChunk(sourceCursor.ChunkIndex);
        var movedEntity = sourceChunk.RemoveAtSwapBack(sourceCursor.RowIndex);

        if (movedEntity.IsValid)
        {
            _locations.Set(movedEntity, new ChunkCursor(sourceCursor.ArchetypeId, sourceCursor.ChunkIndex, sourceCursor.RowIndex));
        }

        var targetStorage = _registry.GetOrCreate(targetSignature);
        var targetCursor = targetStorage.AddEntity(entityId);
        _locations.Set(entityId, targetCursor);

        return ChunkRelocationResult.Completed(new ChunkRelocation(
            entityId,
            sourceCursor,
            targetCursor,
            movedEntity));
    }

    private ChunkedArchetypeStorage? FindStorage(ArchetypeId id)
    {
        return _registry.Storages.FirstOrDefault(storage => storage.Signature.Id == id);
    }
}
