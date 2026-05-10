using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class EntityLocationTableTests
{
    [Fact]
    public void SetAndTryGet_ReturnsStoredCursor()
    {
        var table = new EntityLocationTable();
        var entity = new EntityId(1);
        var cursor = new ChunkCursor(new ArchetypeId("A"), 0, 2);

        table.Set(entity, cursor);

        Assert.True(table.TryGet(entity, out var found));
        Assert.Equal(cursor, found);
    }
}
