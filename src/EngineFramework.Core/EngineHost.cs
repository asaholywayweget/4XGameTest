namespace EngineFramework.Core;

public sealed class EngineHost
{
    private readonly List<IEngineSystem> _systems = new();
    private bool _initialized;

    public EngineHost(EngineConfig config, IDiagnosticsSink? diagnostics = null)
    {
        config.Validate();
        Context = new EngineContext(
            config,
            new FixedStepClock(config.FixedDeltaSeconds),
            diagnostics ?? NullDiagnosticsSink.Instance);
    }

    public EngineContext Context { get; }

    public void AddSystem(IEngineSystem system)
    {
        if (_initialized)
            throw new InvalidOperationException("Cannot add systems after initialization.");

        _systems.Add(system);
    }

    public void Initialize()
    {
        if (_initialized)
            return;

        foreach (var system in _systems)
            system.Initialize(Context);

        _initialized = true;
    }

    public EngineTime Tick()
    {
        if (!_initialized)
            Initialize();

        Context.Clock.Advance(Context.Config.FixedDeltaSeconds);

        foreach (var system in _systems)
            system.Tick(Context);

        return Context.Time;
    }

    public void Shutdown()
    {
        for (var i = _systems.Count - 1; i >= 0; i--)
            _systems[i].Shutdown(Context);

        _initialized = false;
    }
}
