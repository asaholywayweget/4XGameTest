using EngineFramework.Math;

namespace EngineFramework.Space;

/// <summary>
/// Hybrid world coordinate: integer chunk address plus local double offset.
/// </summary>
public readonly record struct WorldCoordinate(
    SpatialLayerId LayerId,
    ChunkAddress Chunk,
    LocalCoordinate Local)
{
    public static WorldCoordinate RootOrigin { get; } = new(
        SpatialLayerId.Root,
        ChunkAddress.Origin,
        LocalCoordinate.Zero);

    public Vec3d ApproximateMeters(double chunkSizeMeters)
    {
        return new Vec3d(
            Chunk.X * chunkSizeMeters + Local.OffsetMeters.X,
            Chunk.Y * chunkSizeMeters + Local.OffsetMeters.Y,
            Chunk.Z * chunkSizeMeters + Local.OffsetMeters.Z);
    }
}
