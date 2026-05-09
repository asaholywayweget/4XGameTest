namespace EngineFramework.Simulation;

public interface IChunkColumn
{
    ComponentTypeId ComponentType { get; }

    int Capacity { get; }

    int Count { get; }

    void RemoveAtSwapBack(int index);
}
