using EngineFramework.Math;
using EngineFramework.Space;
using Xunit;

namespace EngineFramework.Space.Tests;

public sealed class WorldCoordinateTests
{
    [Fact]
    public void ApproximateMeters_ComposesChunkAndLocalOffset()
    {
        var coordinate = new WorldCoordinate(
            SpatialLayerId.Root,
            new ChunkAddress(2, -1, 0),
            new LocalCoordinate(new Vec3d(5, 3, 1)));

        var result = coordinate.ApproximateMeters(10);

        Assert.Equal(new Vec3d(25, -7, 1), result);
    }
}
