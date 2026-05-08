using EngineFramework.Core;
using Xunit;

namespace EngineFramework.Core.Tests;

public sealed class EngineTimeTests
{
    [Fact]
    public void Advance_IncrementsTickAndTotalSeconds()
    {
        var next = EngineTime.Zero.Advance(0.5);

        Assert.Equal(1, next.Tick.Value);
        Assert.Equal(0.5, next.DeltaSeconds);
        Assert.Equal(0.5, next.TotalSeconds);
    }

    [Fact]
    public void Advance_RejectsNegativeDelta()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => EngineTime.Zero.Advance(-0.1));
    }
}
