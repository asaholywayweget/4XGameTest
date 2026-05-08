using EngineFramework.Core;
using Xunit;

namespace EngineFramework.Core.Tests;

public sealed class EngineHostTests
{
    [Fact]
    public void Tick_InitializesAndTicksSystems()
    {
        var host = new EngineHost(new EngineConfig { FixedDeltaSeconds = 0.25 });
        var system = new CountingSystem();
        host.AddSystem(system);

        var time = host.Tick();

        Assert.Equal(1, system.InitializeCount);
        Assert.Equal(1, system.TickCount);
        Assert.Equal(1, time.Tick.Value);
        Assert.Equal(0.25, time.TotalSeconds);
    }

    private sealed class CountingSystem : IEngineSystem
    {
        public string Name => "CountingSystem";
        public int InitializeCount { get; private set; }
        public int TickCount { get; private set; }

        public void Initialize(EngineContext context) => InitializeCount++;

        public void Tick(EngineContext context) => TickCount++;

        public void Shutdown(EngineContext context) { }
    }
}
