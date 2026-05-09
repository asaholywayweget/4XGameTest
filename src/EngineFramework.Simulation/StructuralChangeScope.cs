namespace EngineFramework.Simulation;

/// <summary>
/// Declares whether a system may request structural changes.
/// Actual changes must still go through DeferredCommandBuffer.
/// </summary>
public enum StructuralChangeScope
{
    None,
    DeferredOnly
}
