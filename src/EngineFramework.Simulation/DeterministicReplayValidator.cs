namespace EngineFramework.Simulation;

public sealed class DeterministicReplayValidator
{
    public ReplayValidationResult Compare(IReadOnlyList<SnapshotFrame> expected, IReadOnlyList<SnapshotFrame> actual)
    {
        var errors = new List<string>();

        if (expected.Count != actual.Count)
            errors.Add($"Snapshot count mismatch. Expected {expected.Count}, actual {actual.Count}.");

        var count = Math.Min(expected.Count, actual.Count);
        for (var i = 0; i < count; i++)
        {
            var a = expected[i];
            var b = actual[i];

            if (a.Tick != b.Tick)
                errors.Add($"Tick mismatch at frame {i}. Expected {a.Tick.Value}, actual {b.Tick.Value}.");

            if (a.EntityCount != b.EntityCount)
                errors.Add($"Entity count mismatch at tick {a.Tick.Value}. Expected {a.EntityCount}, actual {b.EntityCount}.");

            if (!string.Equals(a.StateHash, b.StateHash, StringComparison.Ordinal))
                errors.Add($"State hash mismatch at tick {a.Tick.Value}.");
        }

        return errors.Count == 0
            ? ReplayValidationResult.Valid
            : new ReplayValidationResult(false, errors);
    }
}
