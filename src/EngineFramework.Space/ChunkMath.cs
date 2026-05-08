using EngineFramework.Math;

namespace EngineFramework.Space;

public static class ChunkMath
{
    public static ChunkAddress ToChunkAddress(Vec3d positionMeters, double chunkSizeMeters)
    {
        if (chunkSizeMeters <= 0)
            throw new ArgumentOutOfRangeException(nameof(chunkSizeMeters), "Chunk size must be positive.");

        return new ChunkAddress(
            FloorToInt(positionMeters.X / chunkSizeMeters),
            FloorToInt(positionMeters.Y / chunkSizeMeters),
            FloorToInt(positionMeters.Z / chunkSizeMeters));
    }

    public static LocalCoordinate ToLocalCoordinate(Vec3d positionMeters, ChunkAddress chunk, double chunkSizeMeters)
    {
        if (chunkSizeMeters <= 0)
            throw new ArgumentOutOfRangeException(nameof(chunkSizeMeters), "Chunk size must be positive.");

        var origin = new Vec3d(
            chunk.X * chunkSizeMeters,
            chunk.Y * chunkSizeMeters,
            chunk.Z * chunkSizeMeters);

        return new LocalCoordinate(positionMeters - origin);
    }

    private static int FloorToInt(double value)
    {
        if (value < int.MinValue || value > int.MaxValue)
            throw new OverflowException("Chunk index exceeded Int32 range.");

        return (int)System.Math.Floor(value);
    }
}
