namespace EngineFramework.Simulation;

public static class ChunkSystemAccess
{
    public static SystemAccessDescriptor Describe(IScheduledChunkSystem system)
    {
        return new SystemAccessDescriptor
        {
            SystemId = system.Descriptor.Id,
            Phase = system.Descriptor.Phase,
            AccessSet = system.Query.AccessSet
        };
    }
}
