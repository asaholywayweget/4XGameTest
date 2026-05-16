# Simulation Clock Constitution

# 模擬時間憲章 v0.1

本文件定義：

- simulation time semantics
- deterministic time progression
- multi-rate simulation
- async time domains
- tick ownership
- runtime synchronization

本文件為：

# Simulation Runtime 的時間語意來源。

---

# 1. Core Principle

本專案：

不得使用：

```txt
Single Global Real-time Tick
```

作為唯一 simulation 時間模型。

---

# 2. Simulation Time

Simulation Time：

為：

# 世界內部時間。

Simulation Time：

不等於：

- wall clock
- render frame time
- platform delta time

---

# 3. Deterministic Time Progression

Simulation：

必須：

- deterministic
- replayable
- synchronizable

禁止：

```txt
Frame-dependent world progression
```

---

# 4. Multi-rate Simulation

不同 simulation domain：

允許使用不同更新頻率。

例如：

| Domain | Typical Rate |
|---|---|
| local physics | high frequency |
| gameplay runtime | medium frequency |
| thermal simulation | slow frequency |
| biological simulation | very slow frequency |
| orbital simulation | ultra slow frequency |

---

# 5. Time Domain Separation

不同時間域：

不得互相假設：

```txt
相同更新頻率
```

所有跨 domain interaction：

必須經過：

- synchronization boundary
- interpolation
- authority validation

---

# 6. Tick Ownership

所有 simulation domain：

必須存在：

```txt
Tick Authority
```

避免：

- uncontrolled advancement
- duplicate simulation
- divergent progression

---

# 7. Async Simulation

本專案允許：

- async simulation
- delayed update
- background simulation
- distributed simulation

但：

所有 async state：

必須遵守：

- deterministic synchronization
- authority boundary
- conflict resolution

---

# 8. Render Time

Render Time：

不得作為：

```txt
Canonical Simulation Time
```

Renderer：

只能觀察 runtime state。

---

# 9. Replay Principle

所有 simulation progression：

必須允許：

- replay
- rollback
- synchronization
- deterministic reproduction

---

# 10. Temporal Streaming

世界時間：

允許：

- temporal LOD
- historical compression
- time decimation
- asynchronous residency

Runtime：

不得假設：

```txt
所有 simulation 永遠同步更新
```

---

# 11. Final Principle

時間：

不是單一 tick。

時間：

是：

# 多尺度、多頻率、多 domain 的 simulation progression system。
