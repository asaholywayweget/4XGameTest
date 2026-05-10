using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkBatchBuilderTests
{
    [Fact]
    public void Build_GroupsChunksByPolicy()
    {
        var signature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var chunks = new[]
        {
            new ArchetypeChunk(signature, new ChunkCapacityPolicy(4)),
            new ArchetypeChunk(signature, new ChunkCapacityPolicy(4)),
            new ArchetypeChunk(signature, new ChunkCapacityPolicy(4))
        };
        var builder = new ChunkBatchBuilder(new ChunkBatchingPolicy(2));

        var batches = builder.Build(chunks);

        Assert.Equal(2, batches.Count);
        Assert.Equal(2, batches[0].Chunks.Count);
        Assert.Single(batches[1].Chunks);
    }
}
