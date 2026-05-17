# Glossary

# 世界語意字典 v0.1

本文件定義：

- canonical runtime terminology
- simulation semantics
- authority semantics
- runtime vocabulary
- material semantics
- streaming semantics

本文件為：

# Simulation-first Framework 的正式語意來源。

---

# A

## ABI

Application Binary Interface。

於本專案中：

指：

# Simulation Runtime 的資料交換契約。

包含：

- field layout
- chunk schema
- serialization
- runtime interoperability
- CPU/GPU synchronization

---

## Approximation Layer

Runtime 使用的世界近似層。

不是 Truth Layer。

允許：

- reduced representation
- interpolation
- streaming proxy
- runtime simplification

---

## Authority

對 canonical world state 擁有合法修改權限的系統。

Authority：

不等於 observer。

---

# C

## Canonical State

世界真實狀態。

Canonical State：

不得由 renderer 或 presentation layer 擁有。

---

## Chunk

世界空間中的 streaming/runtime 管理單位。

Chunk：

必須存在：

- ownership
- residency state
- serialization boundary
- synchronization boundary

---

## Compiled Runtime Proxy

由 Truth Layer 經過 reduction 與 compilation 後：

生成的 runtime representation。

用於：

- rendering
- runtime physics
- streaming runtime
- gameplay interaction

---

# D

## Deterministic Runtime

可 replay、可同步、可重現的 runtime。

Deterministic Runtime：

禁止依賴 frame-dependent progression。

---

# E

## EventBus Pollution

EventBus：

未受 authority/scheduler 控制時：

造成：

- hidden mutation
- implicit authority
- execution ambiguity
- runtime divergence

的架構污染現象。

---

# F

## Field

空間中的連續或離散資料分布。

例如：

- density field
- stress field
- thermal field
- material field
- fracture field

Field：

不得成為 unbounded mutable global state。

---

# G

## Gameplay Consumer

Gameplay：

於本專案中：

為 Runtime Consumer。

Gameplay：

不擁有 canonical world authority。

---

# I

## Interactive Runtime

玩家可互動的 runtime approximation layer。

Interactive Runtime：

不是 Truth Layer。

---

# L

## Local Interaction Domain

允許高 fidelity simulation 的局部區域。

避免：

global full-fidelity runtime。

---

# M

## Material IR

Unified Material Runtime 的統一語意表示。

Material IR：

作為：

- rendering
- thermal
- structural
- biological
- gameplay

之間的共享材料語意層。

---

## Material Proxy

供 Runtime 使用的降階材料表示。

Material Proxy：

不是完整 solver state。

---

## Multi-scale Runtime

不同 simulation domain：

允許使用不同 fidelity、不同 solver、不同 update rate。

但：

共享世界語意與 world constants。

---

# O

## Observer

只能觀察 runtime state。

不得修改 canonical world state。

Renderer：

屬於 observer。

---

## Ownership

對 runtime state/chunk/field 擁有合法控制權限。

Ownership：

必須唯一且可驗證。

---

# P

## Physics Streaming

以 streaming residency 為核心的 runtime simulation 架構。

不是：

global always-active simulation。

---

## Proxy

Truth Layer 經 reduction 後：

產生的 runtime-friendly representation。

---

# R

## Residency

runtime data 是否存在於目前 active memory/runtime domain 的狀態。

---

## Runtime Consumer

消費 runtime representation 的系統。

例如：

- renderer
- gameplay
- UI
- AI

Runtime Consumer：

不擁有 canonical authority。

---

## Runtime Representation

供 interactive runtime 使用的 approximation representation。

不是 Truth Layer solver state。

---

# S

## Scheduler

管理：

- execution ordering
- synchronization
- mutation windows
- dependency graph

的 runtime governance system。

---

## Simulation ABI

Simulation Runtime 的 interoperability contract。

---

## Sparse Residency

只有 active/runtime-relevant world data 存在於 runtime memory。

---

# T

## Temporal LOD

不同 simulation domain：

允許使用不同時間解析度。

---

## Truth Layer

高 fidelity canonical simulation layer。

Truth Layer：

不是 interactive runtime。

---

# V

## Validation

驗證世界一致性、合法性、determinism 與 semantic correctness 的治理系統。

Validation：

不是單純 debug feature。
