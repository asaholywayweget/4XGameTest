using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkQueryExecutorTests
{
    [Fact]
    public void Execute_ReturnsChunksMatchingRequiredComponentAccess()
    {
        var registry = new ChunkedArchetypeRegistry(new ChunkCapacityPolicy(4));
        var matchingSignature = new ArchetypeSignature(new[] { ComponentTypeId.From<TestComponent>() });
        var otherSignature = new ArchetypeSignature(new[] { new ComponentTypeId("Other") });

        var matching = registry.GetOrCreate(matchingSignature);
        matching.AddEntity(new EntityId(1));

        var other = registry.GetOrCreate(otherSignature);
        other.AddEntity(new EntityId(2));

        var executor = new ChunkQueryExecutor(registry);
        var cursor = executor.Execute(ChunkQuery.Read<TestComponent>());

        var chunks = cursor.Chunks().ToArray();

        Assert.Single(chunks);
        Assert.Equal(new EntityId(1), chunks[0].GetEntityId(0));
    }

    private readonly record struct TestComponent(int Value) : IComponent;
}
