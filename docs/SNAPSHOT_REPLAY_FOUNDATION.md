# Snapshot Replay Foundation

Version: v0.1

Purpose:
Establish deterministic validation primitives for simulation runtime.

Initial concepts:

- SnapshotFrame
- ISnapshotHasher
- DefaultSnapshotHasher
- SnapshotRecorder
- RecordedCommand
- ReplayInputStream
- ReplayCommandIngestionStage
- SnapshotRecordingStage
- DeterministicReplayValidator

Current scope:

- hash entity ids
- record snapshot frames
- compare replay outputs
- ingest minimal replay commands
- validate deterministic smoke tests

Limitations:

- component hashing is not implemented yet
- binary serialization is not implemented yet
- rollback is not implemented yet
- replay runtime wrapper is deferred

Future direction:

1. Component state hashing.
2. Chunk storage hashing.
3. Command log serialization.
4. Replay runtime runner.
5. Rollback checkpoints.
6. Network sync validation.
7. Cross-platform determinism checks.

Rule:

Snapshot and replay are validation systems, not rendering systems.
