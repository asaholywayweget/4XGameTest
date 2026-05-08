namespace EngineFramework.Core;

/// <summary>
/// Monotonic simulation tick index.
/// </summary>
public readonly record struct EngineTick(long Value)
{
    public static EngineTick Zero { get; } = new(0);

    public EngineTick Next() => new(Value + 1);

    public static EngineTick operator +(EngineTick tick, long delta) => new(tick.Value + delta);
}
