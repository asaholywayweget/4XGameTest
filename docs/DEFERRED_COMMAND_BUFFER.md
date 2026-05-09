# Deferred Command Buffer

Version: v0.1

Purpose:
Prevent systems from mutating ECS structure directly during iteration or future parallel execution.

Initial concepts:

- StructuralCommandType
- StructuralCommand
- DeferredCommandBuffer
- StructuralCommandPlayback
- MutationBarrier
- CommandPlaybackResult
- StructuralChangeScope

Current scope:

- record structural commands
- drain commands deterministically
- apply create/destroy at mutation barrier
- defer component migration implementation

Rules:

1. Systems must not mutate chunk structure while iterating chunks.
2. Structural changes must be buffered.
3. Playback happens only at mutation barriers.
4. Command ordering must be deterministic.
5. Component payload serialization is intentionally deferred.

Future direction:

1. Component add/remove migration between archetypes.
2. Deterministic command sorting by system and tick.
3. Per-thread command buffers.
4. Replay-compatible command logs.
5. Rollback-compatible structural playback.
6. Validation of command side effects.
