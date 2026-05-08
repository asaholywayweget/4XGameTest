using EngineFramework.Math;
using Xunit;

namespace EngineFramework.Math.Tests;

public sealed class PrecisionPolicyTests
{
    [Fact]
    public void NearlyEqual_UsesConfiguredEpsilon()
    {
        var policy = new PrecisionPolicy(0.01);

        Assert.True(policy.NearlyEqual(1.0, 1.005));
        Assert.False(policy.NearlyEqual(1.0, 1.02));
    }
}
