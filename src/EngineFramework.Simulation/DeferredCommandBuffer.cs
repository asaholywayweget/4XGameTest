using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Records structural ECS mutations for later playback at a safe barrier point.
/// </summary>
public sealed class DeferredCommandBuffer
{
    private readonly List<StructuralCommand> _commands = new();

    public int Count => _commands.Count;

    public IReadOnlyList<StructuralCommand> Commands => _commands;

    public void CreateEntity(EngineTick tick)
    {
        _commands.Add(new StructuralCommand(
            tick,
            StructuralCommandType.CreateEntity,
            EntityId.Invalid,
            default,
            string.Empty));
    }

    public void DestroyEntity(EngineTick tick, EntityId entityId)
    {
        if (!entityId.IsValid)
            throw new ArgumentException("EntityId must be valid.", nameof(entityId));

        _commands.Add(new StructuralCommand(
            tick,
            StructuralCommandType.DestroyEntity,
            entityId,
            default,
            string.Empty));
    }

    public void AddComponent(EngineTick tick, EntityId entityId, ComponentTypeId componentType, string payload = "")
    {
        if (!entityId.IsValid)
            throw new ArgumentException("EntityId must be valid.", nameof(entityId));

        if (componentType.IsEmpty)
            throw new ArgumentException("Component type cannot be empty.", nameof(componentType));

        _commands.Add(new StructuralCommand(
            tick,
            StructuralCommandType.AddComponent,
            entityId,
            componentType,
            payload));
    }

    public StructuralCommand[] Drain()
    {
        var drained = _commands.ToArray();
        _commands.Clear();
        return drained;
    }
}
