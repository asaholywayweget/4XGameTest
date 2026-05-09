# Chunk Iteration and Access Model

Version: v0.1

Purpose:
Define how systems declare component access and iterate chunked ECS data.

Initial concepts:

- ComponentAccessMode
- ComponentAccess
- ComponentAccessSet
- ChunkQuery
- ChunkQueryCursor
- ChunkView
- ChunkQueryExecutor
- IScheduledChunkSystem
- ChunkSystemRunner

Current scope:

- managed chunk iteration
- explicit read/write access declarations
- query-to-storage filtering
- deterministic chunk traversal order

Why this matters:

The scheduler cannot safely parallelize systems until component access is explicit.

Conflict rule:

- read + read = compatible
- read + write = conflict
- write + write = conflict

Future direction:

1. Use ComponentAccessSet in scheduler batching.
2. Generate parallel execution groups.
3. Add read-only chunk views.
4. Add unsafe/native memory backend.
5. Add snapshot-friendly chunk iteration.
