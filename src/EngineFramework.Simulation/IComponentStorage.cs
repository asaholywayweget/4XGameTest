namespace EngineFramework.Simulation;

/// <summary>
/// Storage abstraction for component data. Current implementation may be simple;
/// future implementations may use SoA, chunked storage, or native memory.
/// </summary>
public interface IComponentStorage
{
    ArchetypeSignature Signature { get; }

    int Count { get; }

    EntityId GetEntityId(int rowIndex);
}
