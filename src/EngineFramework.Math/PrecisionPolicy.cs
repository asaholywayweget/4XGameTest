namespace EngineFramework.Math;

/// <summary>
/// Numerical tolerance policy used by tests and validation systems.
/// </summary>
public readonly record struct PrecisionPolicy(double Epsilon)
{
    public static PrecisionPolicy Default { get; } = new(1e-9);
    public static PrecisionPolicy Loose { get; } = new(1e-6);
    public static PrecisionPolicy Strict { get; } = new(1e-12);

    public bool NearlyEqual(double a, double b) => System.Math.Abs(a - b) <= Epsilon;

    public bool NearlyZero(double value) => System.Math.Abs(value) <= Epsilon;
}
