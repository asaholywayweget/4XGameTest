namespace EngineFramework.Simulation;

/// <summary>
/// Describes the expected traversal pattern for chunk queries.
/// </summary>
public enum ChunkAccessPattern
{
    Sequential,
    RandomAccess,
    HotPath
}
