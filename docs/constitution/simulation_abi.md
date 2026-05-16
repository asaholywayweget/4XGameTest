# Simulation ABI Constitution

# 模擬 ABI 憲章 v0.1

本文件定義：

- runtime interoperability
- world data contracts
- field layout semantics
- serialization contracts
- deterministic data rules
- CPU/GPU interoperability

本文件為：

# Simulation Runtime 的資料與 interoperability 規格來源。

---

# 1. Core Principle

Simulation Runtime：

不得依賴：

```txt
Implementation-specific Memory Semantics
```

作為 canonical runtime contract。

---

# 2. ABI Purpose

Simulation ABI：

定義：

# Runtime 世界資料交換契約。

Simulation ABI：

必須允許：

- multi-language runtime
- CPU/GPU interoperability
- deterministic replay
- distributed simulation
- streaming runtime
- serialization

---

# 3. Canonical Data Semantics

所有 runtime data：

必須存在：

- semantic meaning
- ownership
- layout contract
- serialization rule
- synchronization rule

避免：

- hidden runtime assumptions
- platform-specific state interpretation
- layout ambiguity

---

# 4. World Data Layout

Simulation world data：

應優先支援：

- SoA
- chunk-oriented layout
- sparse field layout
- streaming-friendly memory structure

避免：

```txt
Object-oriented deep pointer graph runtime
```

作為 canonical simulation representation。

---

# 5. Chunk Schema

所有 chunk：

必須定義：

- chunk identity
- ownership
- residency state
- serialization boundary
- streaming contract

chunk：

不得依賴：

```txt
Implicit global state access
```

---

# 6. Field Schema

所有 field：

必須定義：

- coordinate space
- resolution
- semantic meaning
- update ownership
- synchronization rule

Field：

不得成為：

```txt
Unbounded global mutable state
```

---

# 7. Deterministic Serialization

Serialization：

必須：

- deterministic
- replayable
- cross-platform consistent
- authority-safe

禁止：

```txt
Platform-dependent canonical state
```

---

# 8. CPU/GPU Interoperability

CPU/GPU：

共享資料時：

必須定義：

- ownership
- synchronization
- mutation boundary
- residency
- transfer contract

避免：

- hidden synchronization
- implicit memory mutation
- divergent runtime state

---

# 9. Distributed Runtime

Distributed Simulation：

必須遵守：

- deterministic synchronization
- authority boundaries
- chunk ownership
- canonical serialization

禁止：

```txt
Uncontrolled distributed mutation
```

---

# 10. Runtime Proxy ABI

Runtime Proxy：

必須存在：

- stable representation
- streaming compatibility
- serialization compatibility
- deterministic meaning

Runtime Proxy：

不得直接依賴：

```txt
Truth Layer Solver State
```

---

# 11. Versioning Principle

Simulation ABI：

必須支援：

- schema versioning
- backward compatibility strategy
- migration policy
- validation rule

避免：

```txt
Silent runtime schema drift
```

---

# 12. Final Principle

Simulation ABI：

不是普通 serialization format。

Simulation ABI：

是：

# 多語言、多平台、多 runtime domain 的世界語意契約。
