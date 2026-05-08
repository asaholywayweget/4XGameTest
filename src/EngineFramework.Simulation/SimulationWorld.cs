using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class SimulationWorld
{
    private readonly Dictionary<EntityId, SimulationEntity> _entities = new();
    private readonly List<ISimulationSystem> _systems = new();

    private long _nextEntityId = 1;

    public SimulationWorld()
    {
        Commands = new CommandQueue();
    }

    public CommandQueue Commands { get; }

    public IReadOnlyCollection<SimulationEntity> Entities => _entities.Values;

    public SimulationEntity CreateEntity()
    {
        var id = new EntityId(_nextEntityId++);
        var entity = new SimulationEntity(id);

        _entities.Add(id, entity);

        return entity;
    }

    public bool DestroyEntity(EntityId id)
    {
        return _entities.Remove(id);
    }

    public void AddSystem(ISimulationSystem system)
    {
        _systems.Add(system);
    }

    public void Tick(EngineTime time)
    {
        foreach (var system in _systems)
            system.Tick(this, time);
    }

    public SimulationSnapshot CreateSnapshot(EngineTick tick)
    {
        return new SimulationSnapshot(
            tick,
            _entities.Count,
            DateTime.UtcNow);
    }
}
