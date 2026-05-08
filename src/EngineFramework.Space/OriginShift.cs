using EngineFramework.Math;

namespace EngineFramework.Space;

/// <summary>
/// Describes a local origin shift for rendering or local simulation views.
/// </summary>
public readonly record struct OriginShift(WorldCoordinate PreviousOrigin, WorldCoordinate NewOrigin)
{
    public Vec3d ApproximateDeltaMeters(double chunkSizeMeters)
    {
        return NewOrigin.ApproximateMeters(chunkSizeMeters) - PreviousOrigin.ApproximateMeters(chunkSizeMeters);
    }
}
