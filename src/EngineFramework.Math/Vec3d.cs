namespace EngineFramework.Math;

/// <summary>
/// Double precision 3D vector primitive.
/// </summary>
public readonly record struct Vec3d(double X, double Y, double Z)
{
    public static Vec3d Zero { get; } = new(0.0, 0.0, 0.0);
    public static Vec3d One { get; } = new(1.0, 1.0, 1.0);
    public static Vec3d UnitX { get; } = new(1.0, 0.0, 0.0);
    public static Vec3d UnitY { get; } = new(0.0, 1.0, 0.0);
    public static Vec3d UnitZ { get; } = new(0.0, 0.0, 1.0);

    public double LengthSquared => X * X + Y * Y + Z * Z;

    public double Length => System.Math.Sqrt(LengthSquared);

    public Vec3d Normalized()
    {
        var length = Length;
        return length <= 0.0 ? Zero : this / length;
    }

    public static double Dot(Vec3d a, Vec3d b) => a.X * b.X + a.Y * b.Y + a.Z * b.Z;

    public static Vec3d Cross(Vec3d a, Vec3d b) => new(
        a.Y * b.Z - a.Z * b.Y,
        a.Z * b.X - a.X * b.Z,
        a.X * b.Y - a.Y * b.X);

    public static double Distance(Vec3d a, Vec3d b) => (a - b).Length;

    public static Vec3d operator +(Vec3d a, Vec3d b) => new(a.X + b.X, a.Y + b.Y, a.Z + b.Z);

    public static Vec3d operator -(Vec3d a, Vec3d b) => new(a.X - b.X, a.Y - b.Y, a.Z - b.Z);

    public static Vec3d operator -(Vec3d value) => new(-value.X, -value.Y, -value.Z);

    public static Vec3d operator *(Vec3d value, double scalar) => new(value.X * scalar, value.Y * scalar, value.Z * scalar);

    public static Vec3d operator *(double scalar, Vec3d value) => value * scalar;

    public static Vec3d operator /(Vec3d value, double scalar)
    {
        if (scalar == 0.0)
            throw new DivideByZeroException("Cannot divide Vec3d by zero.");

        return new Vec3d(value.X / scalar, value.Y / scalar, value.Z / scalar);
    }
}
