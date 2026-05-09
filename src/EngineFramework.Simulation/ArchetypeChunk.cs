namespace EngineFramework.Simulation;

/// <summary>
/// Physical storage block for entities sharing an archetype.
/// </summary>
public sealed class ArchetypeChunk
{
    private readonly EntityId[] _entities;
    private readonly Dictionary<ComponentTypeId, IChunkColumn> _columns = new();

    public ArchetypeChunk(ArchetypeSignature signature, ChunkCapacityPolicy capacityPolicy)
    {
        capacityPolicy.Validate();

        Signature = signature;
        CapacityPolicy = capacityPolicy;
        _entities = new EntityId[capacityPolicy.EntitiesPerChunk];
    }

    public ArchetypeSignature Signature { get; }

    public ChunkCapacityPolicy CapacityPolicy { get; }

    public int Capacity => CapacityPolicy.EntitiesPerChunk;

    public int Count { get; private set; }

    public bool IsFull => Count >= Capacity;

    public IReadOnlyCollection<IChunkColumn> Columns => _columns.Values;

    public EntityId GetEntityId(int rowIndex)
    {
        if ((uint)rowIndex >= (uint)Count)
            throw new ArgumentOutOfRangeException(nameof(rowIndex));

        return _entities[rowIndex];
    }

    public void AddColumn<T>() where T : struct, IComponent
    {
        var type = ComponentTypeId.From<T>();
        if (_columns.ContainsKey(type))
            return;

        _columns.Add(type, new ChunkColumn<T>(Capacity));
    }

    public ChunkColumn<T> GetColumn<T>() where T : struct, IComponent
    {
        var type = ComponentTypeId.From<T>();
        if (_columns.TryGetValue(type, out var column))
            return (ChunkColumn<T>)column;

        throw new KeyNotFoundException($"Column not found: {type}");
    }

    public int AddEntity(EntityId entityId)
    {
        if (IsFull)
            throw new InvalidOperationException("ArchetypeChunk is full.");

        var row = Count;
        _entities[row] = entityId;
        Count++;
        return row;
    }

    public EntityId RemoveAtSwapBack(int rowIndex)
    {
        if ((uint)rowIndex >= (uint)Count)
            throw new ArgumentOutOfRangeException(nameof(rowIndex));

        var last = Count - 1;
        var movedEntity = _entities[last];

        _entities[rowIndex] = _entities[last];
        _entities[last] = EntityId.Invalid;

        foreach (var column in _columns.Values)
            column.RemoveAtSwapBack(rowIndex);

        Count--;
        return rowIndex < Count ? movedEntity : EntityId.Invalid;
    }
}
