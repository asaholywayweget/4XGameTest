using EngineFramework.Simulation;
using Xunit;

namespace EngineFramework.Simulation.Tests;

public sealed class ChunkColumnTests
{
    [Fact]
    public void Add_StoresValuesInOrder()
    {
        var column = new ChunkColumn<TestComponent>(2);

        column.Add(new TestComponent(10));
        column.Add(new TestComponent(20));

        Assert.Equal(new TestComponent(10), column.Get(0));
        Assert.Equal(new TestComponent(20), column.Get(1));
    }

    [Fact]
    public void RemoveAtSwapBack_MovesLastValue()
    {
        var column = new ChunkColumn<TestComponent>(3);
        column.Add(new TestComponent(10));
        column.Add(new TestComponent(20));
        column.Add(new TestComponent(30));

        column.RemoveAtSwapBack(0);

        Assert.Equal(2, column.Count);
        Assert.Equal(new TestComponent(30), column.Get(0));
    }

    private readonly record struct TestComponent(int Value) : IComponent;
}
