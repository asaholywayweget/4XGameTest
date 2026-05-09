namespace EngineFramework.Simulation;

public sealed record SchedulerValidationResult(bool IsValid, IReadOnlyList<string> Errors)
{
    public static SchedulerValidationResult Valid { get; } = new(true, Array.Empty<string>());

    public static SchedulerValidationResult Invalid(params string[] errors) => new(false, errors);
}
