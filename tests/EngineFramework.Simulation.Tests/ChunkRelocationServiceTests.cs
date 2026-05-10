using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkRelocationServiceTests
{
    [Fact]
    public void Relocate_MovesEntityToTargetArchetypeAndUpdatesLocation()
    {
        var registry = new ChunkedArchetypeRegistry(new ChunkCapacityPolicy(4));
        var locations = new EntityLocationTable();
        var sourceSignature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var targetSignature = new ArchetypeSignature(new[] { new ComponentTypeId("A"), new ComponentTypeId("B") });
        var sourceStorage = registry.GetOrCreate(sourceSignature);
        var entity = new EntityId(1);
        var sourceCursor = sourceStorage.AddEntity(entity);
        locations.Set(entity, sourceCursor);

        var service = new ChunkRelocationService(registry, locations);
        var result = service.Relocate(entity, targetSignature);

        Assert.True(result.Success);
        Assert.True(locations.TryGet(entity, out var newCursor));
        Assert.Equal(targetSignature.Id, newCursor.ArchetypeId);
    }

    [Fact]
    public void Relocate_RemapsSwapBackMovedEntity()
    {
        var registry = new ChunkedArchetypeRegistry(new ChunkCapacityPolicy(4));
        var locations = new EntityLocationTable();
        var sourceSignature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var targetSignature = new ArchetypeSignature(new[] { new ComponentTypeId("A"), new ComponentTypeId("B") });
        var sourceStorage = registry.GetOrCreate(sourceSignature);
        var first = new EntityId(1);
        var second = new EntityId(2);
        locations.Set(first, sourceStorage.AddEntity(first));
        locations.Set(second, sourceStorage.AddEntity(second));

        var service = new ChunkRelocationService(registry, locations);
        var result = service.Relocate(first, targetSignature);

        Assert.True(result.Success);
        Assert.True(locations.TryGet(second, out var movedCursor));
        Assert.Equal(0, movedCursor.RowIndex);
    }
}
