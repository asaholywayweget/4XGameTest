using EngineFramework.Core;
using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ParallelBatchRunnerTests
{
    [Fact]
    public void Run_ExecutesAllBatchesSynchronously()
    {
        var signature = new ArchetypeSignature(new[] { new ComponentTypeId("A") });
        var chunkA = new ArchetypeChunk(signature, new ChunkCapacityPolicy(4));
        var chunkB = new ArchetypeChunk(signature, new ChunkCapacityPolicy(4));
        var batchA = new ChunkBatch(0, new[] { chunkA });
        var batchB = new ChunkBatch(1, new[] { chunkB });
        var cachedQuery = new CachedChunkQuery("test", new ChunkQuery(new ComponentAccessSet(Array.Empty<ComponentAccess>())), ChunkAccessPattern.Sequential);
        var plan = new ChunkIterationPlan(cachedQuery, new[] { batchA, batchB });
        var context = new BatchExecutionContext(EngineTime.Zero, plan, new DeferredCommandBuffer());
        var job = new CountingBatchJob();
        var runner = new ParallelBatchRunner();

        var result = runner.Run(job, context);

        Assert.True(result.Success);
        Assert.Equal(2, result.BatchCount);
        Assert.Equal(2, result.CompletedJobs);
        Assert.Equal(2, job.Count);
    }

    private sealed class CountingBatchJob : IChunkBatchJob
    {
        public string Name => "Counting";
        public int Count { get; private set; }

        public void Execute(ChunkBatch batch, BatchExecutionContext context)
        {
            Count++;
        }
    }
}
