# World Constitution

# 世界規格憲章 v0.1

本文件定義：

- 世界基礎語意
- Simulation-first 原則
- 多尺度一致性
- Runtime Approximation 原則
- Material Runtime 原則
- Simulation ABI 原則
- 世界合法性與驗證原則

本文件為：

# 專案最高層級語意規格

所有 Runtime、Simulation、Rendering、Gameplay、AI、Networking、Asset Pipeline 都必須遵守本文件。

---

# 1. Core Philosophy

## 1.1 Simulation-first

本專案的核心不是傳統 gameplay loop。

本專案核心為：

```txt
可驗證的多尺度模擬世界
```

Gameplay、Rendering、AI、Network：

皆為：

```txt
Runtime Consumer
```

而非世界本身。

---

## 1.2 World Consistency

世界中的：

- 材料
- 生物
- 結構
- 熱
- 光
- 大氣
- 軌道
- 地質

必須共享：

- 同一套世界常數
- 同一套物理語意
- 同一套能量守恆原則
- 同一套 Material IR

禁止：

```txt
各系統獨立定義世界規則
```

---

## 1.3 Runtime Is Approximation

Runtime 並非完整真實求解。

Runtime 為：

```txt
Reality Approximation Layer
```

高精度模擬：

只存在於：

```txt
Truth Layer
```

---

# 2. Multi-scale World Model

世界由多尺度構成。

```txt
Quantum / Atomic
    ↓
Molecular
    ↓
Microstructure
    ↓
Material
    ↓
Structure
    ↓
Planetary / Ecological
    ↓
Runtime Gameplay
```

---

## 2.1 Effective Scale Principle

不同尺度：

使用不同有效理論。

禁止：

```txt
全世界同精度求解
```

---

## 2.2 Shared Semantic Principle

不同尺度可使用不同 solver。

但：

必須共享：

- 世界常數
- 單位系統
- 能量方向
- Material IR
- 世界語意

---

# 3. Material Runtime

## 3.1 Material Is Not Texture

Material 不等於 PBR Texture。

Material 為：

```txt
多物理場材料描述
```

至少包含：

- Optical
- Mechanical
- Thermal
- Chemical
- Structural
- Biological

資訊。

---

## 3.2 Material IR

所有材料：

最終必須輸出：

```txt
Material IR
```

作為：

- Renderer
- Physics
- Thermal
- Biology
- Gameplay

之間的統一語意層。

---

## 3.3 Material Proxy

Runtime 不允許直接使用：

- 全原子求解
- 高精度 Truth Layer

Runtime 必須使用：

```txt
Compiled Material Proxy
```

---

## 3.4 Material Field

Material 不應僅存在於 Mesh Surface。

Material 可存在於：

```txt
3D Spatial Field
```

包含：

- density
- stress
- temperature
- fracture
- anisotropy
- damage

等空間分布資訊。

---

# 4. Simulation Pipeline

## 4.1 Truth Layer

高精度離線模擬。

可能包含：

- MD
- FEM
- SPH
- Thermal Simulation
- Orbital Simulation
- Biological Simulation

---

## 4.2 Reduction Layer

Truth Layer 不直接進 Runtime。

必須經過：

```txt
Model Reduction
```

生成：

- LUT
- Tensor Proxy
- Material Proxy
- Runtime Field

---

## 4.3 Compilation Layer

Simulation 必須可編譯。

Simulation Asset 不等於普通遊戲資產。

Simulation Asset 為：

```txt
Compiled Physical Approximation
```

---

## 4.4 Runtime Layer

Runtime：

只負責：

- approximation
- interpolation
- streaming
- local interaction

禁止：

```txt
全域高精度即時求解
```

---

# 5. Physics Streaming

## 5.1 Hierarchical Fidelity

世界精度必須分層。

```txt
Far Distance
    ↓ low fidelity
Mid Distance
    ↓ medium fidelity
Near Interaction
    ↓ high fidelity
Local Solver
```

---

## 5.2 Sparse Representation

世界資料必須支援：

- sparse field
- chunk streaming
- clipmap
- residency
- out-of-core simulation

---

## 5.3 Streaming-first Runtime

Runtime 核心不是 solver。

Runtime 核心為：

```txt
Physics Asset Streaming
```

---

# 6. Deterministic Runtime

Runtime 必須可 replay。

Runtime 必須：

- deterministic
- tick based
- replayable
- synchronizable

禁止：

```txt
frame dependent simulation
```

---

# 7. Validation

## 7.1 World Validation

所有世界資產：

在 publish 前：

必須經過：

- thermal validation
- structural validation
- orbital validation
- energy validation
- stability validation

---

## 7.2 Illegal World Prevention

禁止生成：

- 無限能量
- 非守恆世界
- 負密度
- 不穩定材料
- 無法收斂結構

除非：

被特殊 Simulation Rule 明確允許。

---

# 8. Renderer Role

Renderer 不擁有世界。

Renderer 為：

```txt
World Observer
```

PBR 為：

```txt
Material Optical Projection
```

而非世界真值。

---

# 9. Gameplay Role

Gameplay 不應直接定義物理。

Gameplay：

只能：

- 消費 Runtime Proxy
- 修改世界狀態
- 觸發 Simulation Event

禁止：

```txt
Gameplay 繞過世界規則
```

---

# 10. Long-term Direction

本專案長期方向：

- Simulation Kernel
- Simulation ABI
- Unified Material Runtime
- Distributed Simulation
- Multi-scale Runtime
- Planetary Simulation
- Megastructure Simulation
- Biological Runtime
- Physics-driven Rendering
- Deterministic RTS Runtime

---

# 11. Final Principle

本專案的核心不是：

```txt
建立遊戲畫面
```

而是：

# 建立可驗證、可擴充、可降階、可互動的模擬世界。
