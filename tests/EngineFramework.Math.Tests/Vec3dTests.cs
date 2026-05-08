using EngineFramework.Math;
using Xunit;

namespace EngineFramework.Math.Tests;

public sealed class Vec3dTests
{
    [Fact]
    public void Cross_ReturnsPerpendicularVector()
    {
        var result = Vec3d.Cross(Vec3d.UnitX, Vec3d.UnitY);

        Assert.Equal(Vec3d.UnitZ, result);
    }

    [Fact]
    public void Dot_ReturnsScalarProjection()
    {
        var result = Vec3d.Dot(new Vec3d(1, 2, 3), new Vec3d(4, 5, 6));

        Assert.Equal(32, result);
    }

    [Fact]
    public void Normalized_ReturnsUnitLength()
    {
        var result = new Vec3d(3, 4, 0).Normalized();

        Assert.True(PrecisionPolicy.Default.NearlyEqual(1.0, result.Length));
    }
}
