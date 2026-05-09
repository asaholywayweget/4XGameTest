namespace EngineFramework.Simulation;

/// <summary>
/// Query descriptor for chunk iteration and future scheduling access analysis.
/// </summary>
public sealed class ChunkQuery
{
    public ChunkQuery(ComponentAccessSet accessSet)
    {
        AccessSet = accessSet;
        SimulationQuery = new SimulationQuery(accessSet.RequiredTypes);
    }

    public ComponentAccessSet AccessSet { get; }

    public SimulationQuery SimulationQuery { get; }

    public static ChunkQuery Read<T>() where T : IComponent => new(new ComponentAccessSet(new[] { ComponentAccess.Read<T>() }));

    public static ChunkQuery Write<T>() where T : IComponent => new(new ComponentAccessSet(new[] { ComponentAccess.Write<T>() }));
}
