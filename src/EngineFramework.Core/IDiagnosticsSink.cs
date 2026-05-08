namespace EngineFramework.Core;

public interface IDiagnosticsSink
{
    void Write(DiagnosticsMessage message);
}
