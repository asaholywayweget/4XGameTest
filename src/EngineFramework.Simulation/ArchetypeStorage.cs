namespace EngineFramework.Simulation;

public sealed class ArchetypeStorage : IComponentStorage
{
    private readonly List<EntityId> _entities = new();

    public ArchetypeStorage(ArchetypeSignature signature)
    {
        Signature = signature;
    }

    public ArchetypeSignature Signature { get; }

    public int Count => _entities.Count;

    public EntityId GetEntityId(int rowIndex) => _entities[rowIndex];

    public int Add(EntityId entityId)
    {
        var row = _entities.Count;
        _entities.Add(entityId);
        return row;
    }
}
