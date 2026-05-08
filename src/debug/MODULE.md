# Debug Module

Ownership:
- diagnostics
- profiling
- validation hooks
- inspector data
- test output

Rule:
Debug systems observe and report. They must not own authoritative simulation state.

Initial contracts:
- Profiler
- Inspector
- ValidationReport
- LogSink
