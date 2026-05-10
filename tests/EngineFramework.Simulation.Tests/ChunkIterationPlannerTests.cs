using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkIterationPlannerTests
{
    [Fact]
    public void Plan_BuildsBatchesFromMatchingChunks()
    {
        var registry = new ChunkedArchetypeRegistry(new ChunkCapacityPolicy(2));
        var signature = new ArchetypeSignature(new[] { ComponentTypeId.From<TestComponent>() });
        var storage = registry.GetOrCreate(signature);
        storage.AddEntity(new EntityId(1));
        storage.AddEntity(new EntityId(2));
        storage.AddEntity(new EntityId(3));

        var executor = new ChunkQueryExecutor(registry);
        var planner = new ChunkIterationPlanner(executor, new ChunkBatchingPolicy(1));
        var cached = new CachedChunkQuery("test", ChunkQuery.Read<TestComponent>(), ChunkAccessPattern.HotPath);

        var plan = planner.Plan(cached);

        Assert.Equal(2, plan.Batches.Count);
        Assert.Equal(3, plan.TotalEntityCount);
    }

    private readonly record struct TestComponent(int Value) : IComponent;
}
