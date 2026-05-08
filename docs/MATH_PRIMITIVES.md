# Math Primitives

Version: v0.1

Purpose:
Provide dependency-free numerical primitives for the engine.

Initial types:

- Vec2d
- Vec3d
- PrecisionPolicy
- RangeD
- UnitScale

Rules:

1. Math must not depend on renderer, database, UI, physics engine, or simulation state.
2. Math primitives should be immutable.
3. Numerical tolerance must be explicit.
4. Large-scale coordinate logic belongs in Space, not Math.
5. Math should stay small and stable.
