using EngineFramework.Core;

namespace EngineFramework.Simulation;

public sealed class ReplayInputStream
{
    private readonly RecordedCommand[] _commands;

    public ReplayInputStream(IEnumerable<RecordedCommand> commands)
    {
        _commands = commands
            .OrderBy(command => command.Tick.Value)
            .ThenBy(command => command.Type, StringComparer.Ordinal)
            .ToArray();
    }

    public IReadOnlyList<RecordedCommand> Commands => _commands;

    public IEnumerable<RecordedCommand> CommandsForTick(EngineTick tick)
    {
        return _commands.Where(command => command.Tick == tick);
    }
}
