using System.Security.Cryptography;
using System.Text;

namespace EngineFramework.Simulation;

/// <summary>
/// Minimal deterministic world hasher.
/// v0.1 hashes entity ids only; component state hashing is added later.
/// </summary>
public sealed class DefaultSnapshotHasher : ISnapshotHasher
{
    public string Hash(SimulationWorld world)
    {
        var ids = world.Entities
            .Select(entity => entity.Id.Value)
            .OrderBy(value => value)
            .ToArray();

        var text = string.Join(",", ids);
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(text));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
