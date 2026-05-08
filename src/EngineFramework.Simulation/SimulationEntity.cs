namespace EngineFramework.Simulation;

public sealed class SimulationEntity
{
    private readonly Dictionary<Type, IComponent> _components = new();

    public SimulationEntity(EntityId id)
    {
        if (!id.IsValid)
            throw new ArgumentException("EntityId must be valid.", nameof(id));

        Id = id;
    }

    public EntityId Id { get; }

    public IReadOnlyCollection<Type> ComponentTypes => _components.Keys;

    public void SetComponent<T>(T component)
        where T : class, IComponent
    {
        _components[typeof(T)] = component;
    }

    public bool HasComponent<T>()
        where T : class, IComponent
    {
        return _components.ContainsKey(typeof(T));
    }

    public T GetComponent<T>()
        where T : class, IComponent
    {
        if (_components.TryGetValue(typeof(T), out var component))
            return (T)component;

        throw new KeyNotFoundException($"Component not found: {typeof(T).Name}");
    }
}
