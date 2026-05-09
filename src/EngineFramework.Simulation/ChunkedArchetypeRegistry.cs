namespace EngineFramework.Simulation;

public sealed class ChunkedArchetypeRegistry
{
    private readonly Dictionary<ArchetypeId, ChunkedArchetypeStorage> _storages = new();

    public ChunkedArchetypeRegistry(ChunkCapacityPolicy capacityPolicy)
    {
        capacityPolicy.Validate();
        CapacityPolicy = capacityPolicy;
    }

    public ChunkCapacityPolicy CapacityPolicy { get; }

    public IReadOnlyCollection<ChunkedArchetypeStorage> Storages => _storages.Values;

    public ChunkedArchetypeStorage GetOrCreate(ArchetypeSignature signature)
    {
        if (_storages.TryGetValue(signature.Id, out var storage))
            return storage;

        storage = new ChunkedArchetypeStorage(signature, CapacityPolicy);
        _storages.Add(signature.Id, storage);
        return storage;
    }

    public IEnumerable<ChunkedArchetypeStorage> Query(SimulationQuery query)
    {
        foreach (var storage in _storages.Values)
        {
            if (query.Matches(storage.Signature))
                yield return storage;
        }
    }
}
