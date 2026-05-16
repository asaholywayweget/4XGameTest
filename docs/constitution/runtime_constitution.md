# Runtime Constitution

# Runtime 憲章 v0.1

本文件定義：

- runtime approximation
- residency rules
- streaming runtime
- runtime proxy lifecycle
- local interaction domain
- runtime authority boundaries

本文件為：

# Interactive Runtime 的核心規格來源。

---

# 1. Core Principle

Runtime：

不是：

```txt
Truth Layer
```

Runtime：

為：

# Interactive Approximation Layer。

---

# 2. Runtime Approximation

Runtime：

只允許：

- approximation
- interpolation
- local interaction
- sparse simulation
- streaming field

禁止：

```txt
Global full-fidelity real-time simulation
```

---

# 3. Runtime Residency

Runtime：

不得假設：

```txt
全世界永遠常駐記憶體
```

Runtime：

必須支援：

- streaming residency
- sparse residency
- chunk activation
- temporal residency
- out-of-core world

---

# 4. Runtime Proxy

Runtime 世界：

優先使用：

```txt
Compiled Runtime Proxy
```

Runtime Proxy：

不得直接暴露：

- Truth Layer Solver State
- Full Precision Internal State
- Solver-specific Memory Layout

---

# 5. Local Interaction Principle

高精度 simulation：

應優先限制於：

```txt
Local Interaction Domain
```

避免：

```txt
Global High-fidelity Runtime
```

---

# 6. Hierarchical Fidelity

Runtime：

必須支援：

- fidelity hierarchy
- simulation LOD
- field decimation
- spatial approximation
- temporal approximation

不同距離：

允許不同 simulation fidelity。

---

# 7. Runtime Authority

Runtime：

不得繞過：

- authority constitution
- scheduler constitution
- simulation ABI

Runtime mutation：

必須經過：

```txt
Controlled Mutation Boundary
```

---

# 8. Streaming-first Runtime

Runtime 核心：

不是：

```txt
Always-active global simulation
```

Runtime 核心：

是：

# Streaming-first Interactive Simulation。

---

# 9. Renderer Separation

Renderer：

不得擁有 runtime authority。

Renderer：

只能觀察：

- runtime proxy
- runtime field
- runtime representation

---

# 10. Runtime Persistence

Runtime State：

允許：

- temporary proxy
- streaming cache
- approximation cache
- transient residency

Canonical Truth：

不得依賴 runtime cache。

---

# 11. Final Principle

Runtime：

不是完整世界。

Runtime：

是：

# 可互動、可 streaming、可降階的世界近似層。
