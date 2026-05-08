using EngineFramework.Math;

namespace EngineFramework.Space;

/// <summary>
/// Local coordinate relative to a chunk origin.
/// </summary>
public readonly record struct LocalCoordinate(Vec3d OffsetMeters)
{
    public static LocalCoordinate Zero { get; } = new(Vec3d.Zero);
}
