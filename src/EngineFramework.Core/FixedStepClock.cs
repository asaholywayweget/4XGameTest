namespace EngineFramework.Core;

public sealed class FixedStepClock : IEngineClock
{
    public FixedStepClock(double fixedDeltaSeconds)
    {
        if (fixedDeltaSeconds <= 0)
            throw new ArgumentOutOfRangeException(nameof(fixedDeltaSeconds), "Fixed delta must be positive.");

        FixedDeltaSeconds = fixedDeltaSeconds;
        Current = EngineTime.Zero;
    }

    public double FixedDeltaSeconds { get; }

    public EngineTime Current { get; private set; }

    public EngineTime Advance(double deltaSeconds)
    {
        Current = Current.Advance(FixedDeltaSeconds);
        return Current;
    }
}
