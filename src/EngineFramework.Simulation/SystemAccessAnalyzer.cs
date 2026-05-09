namespace EngineFramework.Simulation;

public sealed class SystemAccessAnalyzer
{
    public SystemConflictGraph BuildConflictGraph(IEnumerable<SystemAccessDescriptor> descriptors)
    {
        var list = descriptors.ToArray();
        var graph = new SystemConflictGraph();

        for (var i = 0; i < list.Length; i++)
        {
            for (var j = i + 1; j < list.Length; j++)
            {
                var a = list[i];
                var b = list[j];

                if (a.Phase != b.Phase)
                    continue;

                if (a.AccessSet.ConflictsWith(b.AccessSet))
                {
                    graph.Add(new SystemConflict(
                        a.SystemId,
                        b.SystemId,
                        "Component access conflict."));
                }
            }
        }

        return graph;
    }
}
