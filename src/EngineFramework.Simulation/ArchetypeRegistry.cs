namespace EngineFramework.Simulation;

public sealed class ArchetypeRegistry
{
    private readonly Dictionary<ArchetypeId, ArchetypeStorage> _storages = new();

    public IReadOnlyCollection<ArchetypeStorage> Storages => _storages.Values;

    public ArchetypeStorage GetOrCreate(ArchetypeSignature signature)
    {
        if (_storages.TryGetValue(signature.Id, out var storage))
            return storage;

        storage = new ArchetypeStorage(signature);
        _storages.Add(signature.Id, storage);
        return storage;
    }

    public IEnumerable<ArchetypeStorage> Query(SimulationQuery query)
    {
        foreach (var storage in _storages.Values)
        {
            if (query.Matches(storage.Signature))
                yield return storage;
        }
    }
}
