namespace EngineFramework.Simulation;

/// <summary>
/// Declares how a system intends to access a component type.
/// </summary>
public readonly record struct ComponentAccess(ComponentTypeId ComponentType, ComponentAccessMode Mode)
{
    public static ComponentAccess Read<T>() where T : IComponent => new(ComponentTypeId.From<T>(), ComponentAccessMode.ReadOnly);

    public static ComponentAccess Write<T>() where T : IComponent => new(ComponentTypeId.From<T>(), ComponentAccessMode.ReadWrite);
}
