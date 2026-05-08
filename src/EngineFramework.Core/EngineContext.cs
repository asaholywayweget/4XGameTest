namespace EngineFramework.Core;

public sealed class EngineContext
{
    public EngineContext(EngineConfig config, IEngineClock clock, IDiagnosticsSink diagnostics)
    {
        Config = config;
        Clock = clock;
        Diagnostics = diagnostics;
    }

    public EngineConfig Config { get; }

    public IEngineClock Clock { get; }

    public IDiagnosticsSink Diagnostics { get; }

    public EngineTime Time => Clock.Current;
}
