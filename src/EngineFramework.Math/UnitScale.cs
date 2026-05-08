namespace EngineFramework.Math;

/// <summary>
/// Explicit scale descriptor for converting authored units to simulation units.
/// </summary>
public readonly record struct UnitScale(double UnitsPerMeter)
{
    public static UnitScale Meters { get; } = new(1.0);
    public static UnitScale Kilometers { get; } = new(0.001);

    public double ToMeters(double value) => value / UnitsPerMeter;

    public double FromMeters(double meters) => meters * UnitsPerMeter;
}
