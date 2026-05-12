using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class WorkerMutationContextTests
{
    [Fact]
    public void Constructor_PreservesWorkerOwnership()
    {
        var buffer = new ThreadLocalCommandBuffer(new WorkerId(4));
        var context = new WorkerMutationContext(new WorkerId(4), buffer);

        Assert.Equal(4, context.WorkerId.Value);
        Assert.Equal(4, context.CommandBuffer.WorkerId.Value);
    }
}
