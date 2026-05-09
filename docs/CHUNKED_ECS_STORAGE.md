# Chunked ECS Storage

Version: v0.1

Purpose:
Move from logical ECS topology toward physical data-oriented storage.

Initial concepts:

- ChunkCapacityPolicy
- IChunkColumn
- ChunkColumn<T>
- ArchetypeChunk
- ChunkCursor
- ChunkedArchetypeStorage
- ChunkedArchetypeRegistry

Current implementation:

- managed memory
- fixed-capacity chunk blocks
- SoA-like component columns
- deterministic chunk insertion order

This is not the final high-performance storage.
It is a migration-safe topology layer.

Future direction:

1. Struct-only components.
2. Native memory backend.
3. Column access declarations for scheduler.
4. Chunk iteration APIs.
5. Snapshot serialization.
6. SIMD-friendly layout.
7. Worker-thread chunk batches.

Rules:

- No renderer ownership.
- No database ownership of live state.
- No hidden global component registry.
- Storage layout changes require validation tests.
