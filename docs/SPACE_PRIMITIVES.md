# Space Primitives

Version: v0.1

Purpose:
Provide the first coordinate and chunk primitives for large-scale simulation.

Initial types:

- SpatialLayerId
- SpatialLayer
- ChunkAddress
- LocalCoordinate
- WorldCoordinate
- ChunkMath
- OriginShift

Rules:

1. Space may depend on Math.
2. Space must not depend on rendering, database, UI, or physics engine implementations.
3. WorldCoordinate uses integer chunk address plus double local offset.
4. Renderer-facing origin shifting must be derived from space state, not own it.
5. Large coordinate precision must be explicit and testable.
