# Scheduler Constitution

# 調度憲章 v0.1

本文件定義：

- simulation scheduling
- dependency governance
- job ownership
- execution ordering
- synchronization barrier
- mutation windows

本文件為：

# Simulation Runtime 的調度規則來源。

---

# 1. Core Principle

Scheduler：

為：

# Runtime Simulation Governance Layer。

Scheduler：

不是：

```txt
單純 task queue
```

---

# 2. Deterministic Scheduling

Simulation execution：

必須：

- deterministic
- replayable
- synchronizable

禁止：

```txt
Non-deterministic mutation ordering
```

---

# 3. Job Ownership

所有 simulation job：

必須存在：

- authority
- ownership
- dependency
- execution boundary

避免：

- hidden mutation
- race condition
- duplicate execution

---

# 4. Dependency Graph

Simulation job：

不得依賴：

```txt
Implicit execution order
```

所有 dependency：

必須顯式定義。

---

# 5. Mutation Windows

世界 mutation：

必須存在：

```txt
Controlled Mutation Window
```

避免：

- uncontrolled concurrent mutation
- divergent runtime state
- synchronization instability

---

# 6. Synchronization Barriers

跨 domain interaction：

必須存在：

- synchronization barrier
- ownership validation
- state consistency check

---

# 7. Async Execution

本專案允許：

- async jobs
- background simulation
- distributed tasks
- GPU execution

但：

所有 async execution：

必須遵守：

- deterministic merge
- authority boundary
- synchronization contract

---

# 8. Event Restrictions

Event：

不得成為 scheduler authority。

Event：

不得隱式控制 execution order。

禁止：

```txt
EventBus-driven Runtime Authority
```

---

# 9. Scheduler Domains

不同 runtime domain：

允許：

- local scheduler
- physics scheduler
- orbital scheduler
- thermal scheduler
- streaming scheduler

但：

所有 scheduler：

必須遵守：

- shared authority rules
- synchronization contracts
- canonical mutation boundary

---

# 10. Runtime Scaling

Scheduler：

必須支援：

- multi-threading
- GPU scheduling
- distributed execution
- streaming-first runtime
- sparse simulation

---

# 11. Final Principle

Scheduler：

不是背景系統。

Scheduler：

是：

# Simulation Runtime 的秩序與 authority 管理核心。
