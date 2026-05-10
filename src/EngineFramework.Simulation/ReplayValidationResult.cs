namespace EngineFramework.Simulation;

public sealed record ReplayValidationResult(
    bool IsValid,
    IReadOnlyList<string> Errors)
{
    public static ReplayValidationResult Valid { get; } = new(true, Array.Empty<string>());

    public static ReplayValidationResult Invalid(params string[] errors) => new(false, errors);
}
