namespace EngineFramework.Simulation;

/// <summary>
/// Stable worker identifier used by thread-local simulation structures.
/// </summary>
public readonly record struct WorkerId(int Value)
{
    public static WorkerId Main { get; } = new(0);

    public bool IsValid => Value >= 0;

    public override string ToString() => Value.ToString();
}
