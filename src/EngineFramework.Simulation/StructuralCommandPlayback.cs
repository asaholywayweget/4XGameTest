namespace EngineFramework.Simulation;

/// <summary>
/// Applies deferred structural commands at a mutation barrier.
/// v0.1 only applies create/destroy. Component migration is documented but deferred.
/// </summary>
public sealed class StructuralCommandPlayback
{
    public CommandPlaybackResult Playback(SimulationWorld world, IEnumerable<StructuralCommand> commands)
    {
        var applied = 0;
        var warnings = new List<string>();

        foreach (var command in commands.OrderBy(command => command.Tick.Value))
        {
            switch (command.Type)
            {
                case StructuralCommandType.CreateEntity:
                    world.CreateEntity();
                    applied++;
                    break;

                case StructuralCommandType.DestroyEntity:
                    if (world.DestroyEntity(command.EntityId))
                        applied++;
                    else
                        warnings.Add($"DestroyEntity skipped; missing entity {command.EntityId}.");
                    break;

                case StructuralCommandType.AddComponent:
                case StructuralCommandType.RemoveComponent:
                case StructuralCommandType.MoveArchetype:
                    warnings.Add($"Command {command.Type} is not implemented in v0.1 playback.");
                    break;

                default:
                    warnings.Add($"Unknown command type {command.Type}.");
                    break;
            }
        }

        return new CommandPlaybackResult(applied, warnings);
    }
}
