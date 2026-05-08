# Kernel Skeleton Phase

Goal:
Create stable module topology before implementation.

Modules:

- core
- math
- space
- simulation
- physics
- database
- render
- debug

Phase rules:

1. No large monolithic code.
2. Every module has ownership notes.
3. Every module defines dependencies.
4. Simulation remains independent from rendering.
5. Implement only after contracts are stable.

First implementation candidate:
- core time and tick model
- math coordinate primitives
- space chunk address
