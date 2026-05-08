namespace EngineFramework.Space;

/// <summary>
/// Defines a spatial scale and its chunk size.
/// </summary>
public sealed record SpatialLayer
{
    public required SpatialLayerId Id { get; init; }

    public SpatialLayerId? ParentId { get; init; }

    public required double ChunkSizeMeters { get; init; }

    public required int Depth { get; init; }

    public void Validate()
    {
        if (Id.IsEmpty)
            throw new InvalidOperationException("Spatial layer id cannot be empty.");

        if (ChunkSizeMeters <= 0)
            throw new InvalidOperationException("Chunk size must be positive.");

        if (Depth < 0)
            throw new InvalidOperationException("Layer depth cannot be negative.");
    }
}
