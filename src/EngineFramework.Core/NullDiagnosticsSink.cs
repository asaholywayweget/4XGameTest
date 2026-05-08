namespace EngineFramework.Core;

public sealed class NullDiagnosticsSink : IDiagnosticsSink
{
    public static NullDiagnosticsSink Instance { get; } = new();

    private NullDiagnosticsSink() { }

    public void Write(DiagnosticsMessage message)
    {
    }
}
