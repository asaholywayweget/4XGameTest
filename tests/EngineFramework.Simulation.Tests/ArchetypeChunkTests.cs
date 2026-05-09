using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ArchetypeChunkTests
{
    [Fact]
    public void AddColumn_CreatesTypedColumn()
    {
        var chunk = CreateChunk();

        chunk.AddColumn<TestComponent>();
        var column = chunk.GetColumn<TestComponent>();

        Assert.Equal(4, column.Capacity);
    }

    [Fact]
    public void AddEntity_StoresEntityId()
    {
        var chunk = CreateChunk();

        chunk.AddEntity(new EntityId(7));

        Assert.Equal(new EntityId(7), chunk.GetEntityId(0));
    }

    private static ArchetypeChunk CreateChunk()
    {
        var signature = new ArchetypeSignature(new[] { ComponentTypeId.From<TestComponent>() });
        return new ArchetypeChunk(signature, new ChunkCapacityPolicy(4));
    }

    private readonly record struct TestComponent(int Value) : IComponent;
}
