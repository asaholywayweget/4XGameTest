namespace EngineFramework.Simulation;

public sealed class JobHandle
{
    public JobHandle(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Job name cannot be empty.", nameof(name));

        Name = name;
        Status = JobStatus.Pending;
    }

    public string Name { get; }

    public JobStatus Status { get; private set; }

    public Exception? Error { get; private set; }

    public void MarkRunning() => Status = JobStatus.Running;

    public void MarkCompleted() => Status = JobStatus.Completed;

    public void MarkFailed(Exception error)
    {
        Error = error;
        Status = JobStatus.Failed;
    }
}
