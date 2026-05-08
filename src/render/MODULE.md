# Render Module

Ownership:
- visualization adapters
- debug drawing
- camera adapters
- render data extraction

Depends on:
- readonly simulation views

Must not own:
- simulation state
- physics state
- authoritative entity state

Initial contracts:
- RenderAdapter
- CameraView
- DebugDraw
- RenderSnapshot
