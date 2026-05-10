# Archetype Migration Pipeline

Version: v0.1

Purpose:
Define the safe topology for moving entities between archetypes when components are added or removed.

Initial concepts:

- ArchetypeTransitionKind
- ArchetypeTransition
- ArchetypeTransitionPlanner
- EntityLocationTable
- ChunkRelocation
- ChunkRelocationResult
- ChunkRelocationService
- ArchetypeMigrationPlan
- ArchetypeMigrationResult
- ArchetypeMigrationService

Current scope:

- transition planning
- entity location tracking
- chunk row relocation
- swap-back remap handling
- archetype target creation

Limitations:

- typed component payload migration is deferred
- serialization of component payload is deferred
- structural command playback is not yet wired to migration service

Why this matters:

Archetype migration is the hardest correctness point in ECS storage.
A wrong migration model breaks replay, chunk iteration, entity lookup, and scheduler safety.

Rules:

1. EntityId must remain stable across migration.
2. ChunkCursor must be updated after migration.
3. Swap-back moved entity must be remapped.
4. Component payload migration requires explicit typed storage support.
5. Migration must occur only at mutation barriers.

Future direction:

1. Add typed component copy between source and target columns.
2. Wire AddComponent and RemoveComponent playback.
3. Add migration validation reports.
4. Add snapshot hashing for chunk storage.
5. Add rollback-safe migration logs.
