using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkedArchetypeStorageTests
{
    [Fact]
    public void AddEntity_CreatesNewChunkWhenFull()
    {
        var signature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var storage = new ChunkedArchetypeStorage(signature, new ChunkCapacityPolicy(2));

        var a = storage.AddEntity(new EntityId(1));
        var b = storage.AddEntity(new EntityId(2));
        var c = storage.AddEntity(new EntityId(3));

        Assert.Equal(0, a.ChunkIndex);
        Assert.Equal(0, b.ChunkIndex);
        Assert.Equal(1, c.ChunkIndex);
        Assert.Equal(2, storage.Chunks.Count);
    }

    [Fact]
    public void ChunkCursor_ReferencesArchetypeChunkAndRow()
    {
        var signature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var storage = new ChunkedArchetypeStorage(signature, new ChunkCapacityPolicy(4));

        var cursor = storage.AddEntity(new EntityId(42));

        Assert.True(cursor.IsValid);
        Assert.Equal(signature.Id, cursor.ArchetypeId);
        Assert.Equal(0, cursor.ChunkIndex);
        Assert.Equal(0, cursor.RowIndex);
    }
}
