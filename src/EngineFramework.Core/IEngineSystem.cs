namespace EngineFramework.Core;

public interface IEngineSystem
{
    string Name { get; }

    void Initialize(EngineContext context);

    void Tick(EngineContext context);

    void Shutdown(EngineContext context);
}
