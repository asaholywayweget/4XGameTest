namespace EngineFramework.Core;

public interface IEngineClock
{
    EngineTime Current { get; }

    EngineTime Advance(double deltaSeconds);
}
