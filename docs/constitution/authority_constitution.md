# Authority Constitution

# 世界 Authority 憲章 v0.1

本文件定義：

- canonical world authority
- ownership
- mutation boundary
- conflict resolution
- runtime authority rule
- solver interaction rule

本文件為：

# 世界狀態控制最高規格。

---

# 1. Core Principle

世界必須存在：

```txt
Canonical World State
```

禁止：

```txt
多個 subsystem 同時擁有最終世界真值
```

---

# 2. Runtime Consumer Rule

Gameplay、Renderer、UI、AI：

皆為：

```txt
Runtime Consumer
```

不是 canonical authority。

---

# 3. Mutation Rule

世界修改：

只能透過：

```txt
Authorized Mutation Boundary
```

進行。

禁止：

- renderer side mutation
- uncontrolled gameplay mutation
- direct eventbus world mutation

---

# 4. Ownership

所有：

- chunk
- field
- runtime proxy
- simulation state

都必須存在：

```txt
Single Authority Owner
```

避免：

- race condition
- divergent simulation
- uncontrolled overwrite

---

# 5. Conflict Resolution

當多個 solver：

同時請求 mutation：

必須經過：

- authority arbitration
- deterministic ordering
- scheduler resolution

禁止：

```txt
last write wins world state
```

---

# 6. EventBus Restriction

EventBus：

不得成為：

```txt
Hidden Authority System
```

Event：

只能：

- request mutation
- notify state transition
- trigger simulation process

不得直接改寫 canonical world state。

---

# 7. Multiplayer Authority

多人 runtime：

必須支援：

- deterministic replay
- rollback
- synchronization
- authority transfer
- ownership validation

---

# 8. Solver Boundary

Solver：

不得直接擁有全域 authority。

Solver：

只能在：

```txt
Declared Mutation Scope
```

內工作。

---

# 9. Final Principle

世界真值：

不可由：

- renderer
- gameplay
- eventbus
- UI
- local visual state

定義。

世界 authority：

必須明確、可追蹤、可驗證。
