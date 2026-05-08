namespace EngineFramework.Math;

public readonly record struct RangeD(double Min, double Max)
{
    public double Length => Max - Min;

    public bool Contains(double value) => value >= Min && value <= Max;

    public double Clamp(double value) => System.Math.Min(System.Math.Max(value, Min), Max);

    public void Validate()
    {
        if (Max < Min)
            throw new InvalidOperationException("RangeD Max cannot be smaller than Min.");
    }
}
