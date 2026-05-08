# Core Module

Ownership:
- engine lifecycle
- stable IDs
- time abstraction
- configuration
- diagnostics

Must not depend on:
- renderer
- database implementation
- physics engine implementation
- UI framework

Initial contracts:
- EngineHost
- EngineClock
- EngineId
- EngineConfig
- DiagnosticsSink
