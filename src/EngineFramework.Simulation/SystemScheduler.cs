namespace EngineFramework.Simulation;

/// <summary>
/// Deterministic single-threaded scheduler topology.
/// Future versions may produce parallel execution batches.
/// </summary>
public sealed class SystemScheduler
{
    public SchedulerValidationResult Validate(IEnumerable<IScheduledSimulationSystem> systems)
    {
        var list = systems.ToArray();
        var errors = new List<string>();
        var ids = new HashSet<SimulationSystemId>();

        foreach (var system in list)
        {
            try
            {
                system.Descriptor.Validate();
            }
            catch (Exception ex)
            {
                errors.Add($"{system.Name}: {ex.Message}");
            }

            if (!ids.Add(system.Descriptor.Id))
                errors.Add($"Duplicate simulation system id: {system.Descriptor.Id}");
        }

        foreach (var system in list)
        {
            foreach (var dependency in system.Descriptor.DependsOn)
            {
                if (!ids.Contains(dependency))
                    errors.Add($"{system.Descriptor.Id} depends on missing system {dependency}");
            }
        }

        if (HasCycle(list))
            errors.Add("Simulation system dependency cycle detected.");

        return errors.Count == 0
            ? SchedulerValidationResult.Valid
            : new SchedulerValidationResult(false, errors);
    }

    public SimulationSchedule Build(IEnumerable<IScheduledSimulationSystem> systems)
    {
        var list = systems.ToArray();
        var validation = Validate(list);
        if (!validation.IsValid)
            throw new InvalidOperationException(string.Join(Environment.NewLine, validation.Errors));

        var sorted = TopologicalSort(list)
            .OrderBy(system => system.Descriptor.Phase)
            .ThenBy(system => system.Descriptor.Order)
            .ThenBy(system => system.Descriptor.Id.Value, StringComparer.Ordinal)
            .ToArray();

        return new SimulationSchedule(sorted);
    }

    private static bool HasCycle(IReadOnlyList<IScheduledSimulationSystem> systems)
    {
        var map = systems.ToDictionary(system => system.Descriptor.Id);
        var visiting = new HashSet<SimulationSystemId>();
        var visited = new HashSet<SimulationSystemId>();

        bool Visit(SimulationSystemId id)
        {
            if (visited.Contains(id))
                return false;

            if (!visiting.Add(id))
                return true;

            if (map.TryGetValue(id, out var system))
            {
                foreach (var dependency in system.Descriptor.DependsOn)
                {
                    if (Visit(dependency))
                        return true;
                }
            }

            visiting.Remove(id);
            visited.Add(id);
            return false;
        }

        return systems.Any(system => Visit(system.Descriptor.Id));
    }

    private static IEnumerable<IScheduledSimulationSystem> TopologicalSort(IReadOnlyList<IScheduledSimulationSystem> systems)
    {
        var map = systems.ToDictionary(system => system.Descriptor.Id);
        var visited = new HashSet<SimulationSystemId>();
        var result = new List<IScheduledSimulationSystem>();

        void Visit(IScheduledSimulationSystem system)
        {
            if (!visited.Add(system.Descriptor.Id))
                return;

            foreach (var dependency in system.Descriptor.DependsOn)
            {
                if (map.TryGetValue(dependency, out var dependencySystem))
                    Visit(dependencySystem);
            }

            result.Add(system);
        }

        foreach (var system in systems
            .OrderBy(system => system.Descriptor.Phase)
            .ThenBy(system => system.Descriptor.Order)
            .ThenBy(system => system.Descriptor.Id.Value, StringComparer.Ordinal))
        {
            Visit(system);
        }

        return result;
    }
}
