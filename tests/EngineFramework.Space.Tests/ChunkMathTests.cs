using EngineFramework.Math;
using EngineFramework.Space;
using Xunit;

namespace EngineFramework.Space.Tests;

public sealed class ChunkMathTests
{
    [Fact]
    public void ToChunkAddress_UsesFloorForPositivePosition()
    {
        var chunk = ChunkMath.ToChunkAddress(new Vec3d(25, 0, 99), 10);

        Assert.Equal(new ChunkAddress(2, 0, 9), chunk);
    }

    [Fact]
    public void ToChunkAddress_UsesFloorForNegativePosition()
    {
        var chunk = ChunkMath.ToChunkAddress(new Vec3d(-1, -10, -11), 10);

        Assert.Equal(new ChunkAddress(-1, -1, -2), chunk);
    }

    [Fact]
    public void ToLocalCoordinate_ReturnsOffsetInsideChunkSpace()
    {
        var chunk = new ChunkAddress(2, 0, -1);
        var local = ChunkMath.ToLocalCoordinate(new Vec3d(25, 3, -7), chunk, 10);

        Assert.Equal(new Vec3d(5, 3, 3), local.OffsetMeters);
    }
}
