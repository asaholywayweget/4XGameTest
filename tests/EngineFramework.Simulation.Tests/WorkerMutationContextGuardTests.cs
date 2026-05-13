using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class WorkerMutationContextGuardTests
{
    [Fact]
    public void Constructor_ThrowsOnOwnershipMismatch()
    {
        var buffer = new ThreadLocalCommandBuffer(new WorkerId(2));

        Assert.Throws<InvalidOperationException>(() =>
            new WorkerMutationContext(new WorkerId(1), buffer));
    }
}
