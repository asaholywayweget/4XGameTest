namespace EngineFramework.Simulation;

/// <summary>
/// Managed SoA-like column. Future versions may replace this with native memory.
/// </summary>
public sealed class ChunkColumn<T> : IChunkColumn
    where T : struct, IComponent
{
    private readonly T[] _values;

    public ChunkColumn(int capacity)
    {
        if (capacity <= 0)
            throw new ArgumentOutOfRangeException(nameof(capacity), "Column capacity must be positive.");

        _values = new T[capacity];
    }

    public ComponentTypeId ComponentType => ComponentTypeId.From<T>();

    public int Capacity => _values.Length;

    public int Count { get; private set; }

    public ref T this[int index] => ref _values[index];

    public int Add(T value)
    {
        if (Count >= Capacity)
            throw new InvalidOperationException("Chunk column is full.");

        var row = Count;
        _values[row] = value;
        Count++;
        return row;
    }

    public void Set(int index, T value)
    {
        if ((uint)index >= (uint)Count)
            throw new ArgumentOutOfRangeException(nameof(index));

        _values[index] = value;
    }

    public T Get(int index)
    {
        if ((uint)index >= (uint)Count)
            throw new ArgumentOutOfRangeException(nameof(index));

        return _values[index];
    }

    public void RemoveAtSwapBack(int index)
    {
        if ((uint)index >= (uint)Count)
            throw new ArgumentOutOfRangeException(nameof(index));

        var last = Count - 1;
        _values[index] = _values[last];
        _values[last] = default;
        Count--;
    }
}
