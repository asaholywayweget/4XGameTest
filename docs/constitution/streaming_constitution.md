# Streaming Constitution

# Streaming 憲章 v0.1

本文件定義：

- streaming residency
- chunk lifecycle
- sparse activation
- runtime residency rules
- temporal residency
- streaming ownership

本文件為：

# Streaming-first Runtime 的 residency 與 lifecycle 規格來源。

---

# 1. Core Principle

本專案 Runtime：

不得假設：

```txt
全世界永遠 active
```

Streaming：

為 Runtime 核心。

---

# 2. Residency Principle

世界資料：

允許：

- unloaded
- prefetched
- resident
- active
- simulating
- frozen
- archived

等不同 residency state。

---

# 3. Chunk Lifecycle

所有 chunk：

必須存在：

- lifecycle state
- ownership
- activation rule
- serialization boundary
- streaming boundary

Chunk：

不得依賴：

```txt
Implicit permanent residency
```

---

# 4. Sparse Activation

Simulation：

應優先只啟用：

```txt
Runtime-relevant regions
```

避免：

```txt
Global always-active simulation
```

---

# 5. Streaming Ownership

所有 streaming state：

必須存在：

- authority
- ownership
- residency controller
- synchronization boundary

避免：

- duplicate residency
- hidden activation
- uncontrolled unloading

---

# 6. Temporal Residency

世界資料：

允許：

- historical compression
- temporal decimation
- asynchronous simulation persistence
- archival state

Runtime：

不得假設：

```txt
所有歷史狀態永遠 active
```

---

# 7. Streaming Domains

Streaming：

允許：

- spatial streaming
- temporal streaming
- field streaming
- proxy streaming
- simulation streaming

但：

所有 streaming domain：

必須遵守：

- authority constitution
- scheduler constitution
- simulation ABI

---

# 8. Runtime Proxy Residency

Runtime Proxy：

允許：

- temporary residency
- streaming cache
- approximation cache
- predictive prefetch

Canonical Truth：

不得依賴 temporary runtime cache。

---

# 9. Distributed Streaming

Distributed Runtime：

必須定義：

- chunk ownership
- transfer boundary
- synchronization rule
- streaming authority

避免：

```txt
Uncontrolled distributed residency
```

---

# 10. Final Principle

Streaming：

不是 IO optimization。

Streaming：

是：

# Simulation-first Runtime 的世界存在管理系統。
