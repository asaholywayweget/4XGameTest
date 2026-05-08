namespace EngineFramework.Math;

/// <summary>
/// Double precision 2D vector primitive.
/// </summary>
public readonly record struct Vec2d(double X, double Y)
{
    public static Vec2d Zero { get; } = new(0.0, 0.0);
    public static Vec2d One { get; } = new(1.0, 1.0);

    public double LengthSquared => X * X + Y * Y;

    public double Length => System.Math.Sqrt(LengthSquared);

    public Vec2d Normalized()
    {
        var length = Length;
        return length <= 0.0 ? Zero : this / length;
    }

    public static double Dot(Vec2d a, Vec2d b) => a.X * b.X + a.Y * b.Y;

    public static Vec2d operator +(Vec2d a, Vec2d b) => new(a.X + b.X, a.Y + b.Y);

    public static Vec2d operator -(Vec2d a, Vec2d b) => new(a.X - b.X, a.Y - b.Y);

    public static Vec2d operator -(Vec2d value) => new(-value.X, -value.Y);

    public static Vec2d operator *(Vec2d value, double scalar) => new(value.X * scalar, value.Y * scalar);

    public static Vec2d operator *(double scalar, Vec2d value) => value * scalar;

    public static Vec2d operator /(Vec2d value, double scalar)
    {
        if (scalar == 0.0)
            throw new DivideByZeroException("Cannot divide Vec2d by zero.");

        return new Vec2d(value.X / scalar, value.Y / scalar);
    }
}
