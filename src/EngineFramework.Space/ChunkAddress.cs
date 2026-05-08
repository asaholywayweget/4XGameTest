namespace EngineFramework.Space;

/// <summary>
/// Integer address of a chunk inside a spatial layer.
/// </summary>
public readonly record struct ChunkAddress(int X, int Y, int Z)
{
    public static ChunkAddress Origin { get; } = new(0, 0, 0);

    public ChunkAddress Offset(int x, int y, int z) => new(X + x, Y + y, Z + z);

    public override string ToString() => $"{X}:{Y}:{Z}";
}
