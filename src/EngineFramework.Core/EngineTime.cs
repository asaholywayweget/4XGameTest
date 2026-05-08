namespace EngineFramework.Core;

/// <summary>
/// Time state observed by simulation systems.
/// </summary>
public readonly record struct EngineTime(
    EngineTick Tick,
    double DeltaSeconds,
    double TotalSeconds)
{
    public static EngineTime Zero { get; } = new(EngineTick.Zero, 0.0, 0.0);

    public EngineTime Advance(double deltaSeconds)
    {
        if (deltaSeconds < 0)
            throw new ArgumentOutOfRangeException(nameof(deltaSeconds), "Delta time cannot be negative.");

        return new EngineTime(Tick.Next(), deltaSeconds, TotalSeconds + deltaSeconds);
    }
}
