using EngineFramework.Core;

namespace EngineFramework.Simulation;

/// <summary>
/// Deferred structural mutation record.
/// Payload is intentionally string-based in v0.1 to avoid locking serialization too early.
/// </summary>
public readonly record struct StructuralCommand(
    EngineTick Tick,
    StructuralCommandType Type,
    EntityId EntityId,
    ComponentTypeId ComponentType,
    string Payload);
