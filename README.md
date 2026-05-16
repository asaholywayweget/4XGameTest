# 引擎框架 v0.1

以模擬（Simulation-first）為核心的長期可擴充引擎框架。

本專案的核心目標不是傳統遊戲流程，而是：

- 多尺度世界模擬
- 長期可擴充的 Simulation Runtime
- Physics-driven Runtime Representation
- Deterministic Runtime
- Simulation Asset Compilation
- 大尺度世界 / RTS / 巨構 / 生態 / 材料 / 軌道系統

本 repo 目前處於：

> Architecture-first / Simulation-first 階段

目前重點為：

- 世界語意統一
- Simulation IR
- Material Runtime
- Physics Streaming
- Runtime Proxy
- Multi-scale Representation

而不是單純 Rendering-first 的遊戲引擎架構。

---

# Core Direction

## Simulation-first

世界先被定義。

Rendering、Gameplay、AI、Network、UI 都是 Runtime Consumer。

不是世界本身。

---

## Multi-scale Simulation

本專案的世界模型由多尺度構成：

```txt
Quantum / Atomic
    ↓
Molecular
    ↓
Lattice / Microstructure
    ↓
Material
    ↓
Structure
    ↓
Planetary / Orbital / Ecological
    ↓
Gameplay Runtime
```

不同尺度共享：

- 同一套世界常數
- 同一套材料語意
- 同一套能量規則
- 同一套 Material IR

但：

不同尺度不共享相同求解精度。

---

## Runtime Approximation

Runtime 並非完整真實世界求解。

而是：

```txt
Truth Layer
    ↓
Reduction Layer
    ↓
Compiled Runtime Proxy
    ↓
Interactive Runtime
```

Runtime 只使用：

- 降階模型
- Physics Proxy
- Streaming Field
- Hierarchical Simulation LOD

---

## Physics-driven Representation

Material 不只是 PBR Texture。

Material 是：

```txt
Optical
Mechanical
Thermal
Chemical
Biological
Structural
```

等多物理場資訊的統一材料表示。

PBR 僅為 Material Runtime 的視覺投影。

---

## Deterministic Runtime

Runtime 以 deterministic tick 為核心。

避免：

- frame dependent simulation
- non-replayable state
- divergent multiplayer simulation

支援：

- RTS
- replay
- rollback
- distributed simulation
- validation

---

# Current Long-term Goals

## Simulation Runtime

建立可長期擴充的：

- Simulation Kernel
- Simulation ABI
- Material IR
- Runtime Proxy System
- Physics Streaming System

---

## Large-scale World Simulation

支援：

- 行星級世界
- 軌道系統
- 人造星體
- 巨構
- 生態系統
- 多層大氣
- 結構破壞
- 熱力學
- RTS 大規模單位

---

## Unified Material Runtime

Material 必須同時驅動：

- Rendering
- Physics
- Thermal
- Damage
- Biology
- Structural Response

避免：

```txt
visual material ≠ physical material
```

造成世界語意破裂。

---

# Initial Structure

```txt
/docs
    /specification
    /simulation
    /runtime
    /materials
    /validation

/src
/tests
/data
/tools
/scripts
```

---

# Documentation Roadmap

## Core Specification

```txt
/docs/specification/
```

預計包含：

- world_constitution.md
- simulation_first.md
- material_ir.md
- simulation_abi.md
- physics_streaming.md
- runtime_proxy.md
- field_representation.md
- validation_pipeline.md
- glossary.md

---

## Simulation Layer

```txt
/docs/simulation/
```

包含：

- multi-scale simulation
- reduction pipeline
- truth layer
- runtime approximation
- material compilation

---

## Runtime Layer

```txt
/docs/runtime/
```

包含：

- ECS
- chunk streaming
- ownership
- threading
- GPU task scheduling
- deterministic runtime

---

## Material Layer

```txt
/docs/materials/
```

包含：

- material field
- material genome
- optical model
- structural response
- biological materials
- thermal response

---

# Project State

目前專案仍處於：

```txt
Architecture Exploration / Simulation Formalization
```

階段。

目前重點為：

- 建立世界一致性
- Formalize Simulation Runtime
- Formalize Material Runtime
- Formalize Simulation ABI
- 建立長期可擴充架構

而非短期 gameplay implementation。
