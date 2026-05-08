namespace EngineFramework.Core;

public sealed record EngineConfig
{
    public string ProjectName { get; init; } = "EngineFramework";

    public double FixedDeltaSeconds { get; init; } = 1.0 / 60.0;

    public bool DeterministicMode { get; init; } = true;

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(ProjectName))
            throw new InvalidOperationException("ProjectName cannot be empty.");

        if (FixedDeltaSeconds <= 0)
            throw new InvalidOperationException("FixedDeltaSeconds must be positive.");
    }
}
