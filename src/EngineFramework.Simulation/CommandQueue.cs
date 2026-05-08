namespace EngineFramework.Simulation;

public sealed class CommandQueue
{
    private readonly Queue<SimulationCommand> _queue = new();

    public int Count => _queue.Count;

    public void Enqueue(SimulationCommand command)
    {
        _queue.Enqueue(command);
    }

    public bool TryDequeue(out SimulationCommand command)
    {
        return _queue.TryDequeue(out command);
    }
}
