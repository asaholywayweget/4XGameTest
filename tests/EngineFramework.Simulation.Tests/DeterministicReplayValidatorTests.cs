using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class DeterministicReplayValidatorTests
{
    [Fact]
    public void Compare_ReturnsValidForSameFrames()
    {
        var frames = new[]
        {
            new SnapshotFrame(new EngineTick(1), 1, "abc")
        };

        var validator = new DeterministicReplayValidator();
        var result = validator.Compare(frames, frames);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Compare_DetectsHashMismatch()
    {
        var expected = new[] { new SnapshotFrame(new EngineTick(1), 1, "abc") };
        var actual = new[] { new SnapshotFrame(new EngineTick(1), 1, "xyz") };

        var validator = new DeterministicReplayValidator();
        var result = validator.Compare(expected, actual);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Contains("hash"));
    }
}
