# Chunk Iteration Optimization

Version: v0.1

Purpose:
Prepare chunk traversal for high-throughput simulation without changing runtime behavior prematurely.

Initial concepts:

- ChunkAccessPattern
- ChunkBatch
- ChunkBatchingPolicy
- ChunkBatchBuilder
- CachedChunkQuery
- ChunkQueryCache
- ChunkIterationPlan
- ChunkIterationPlanner
- HotPathQueryRegistry

Current scope:

- cache query descriptors
- group chunks into deterministic batches
- expose hot-path query registration
- preserve managed-memory storage

Not in scope yet:

- caching live chunk lists
- invalidation tracking
- native memory spans
- SIMD iteration
- actual worker threads

Future direction:

1. Query result cache with invalidation.
2. Chunk generation counters.
3. Read-only spans.
4. Parallel batch execution.
5. SIMD-friendly column views.
6. GPU upload batches.

Rule:

Optimization layers must not change authoritative simulation semantics.
