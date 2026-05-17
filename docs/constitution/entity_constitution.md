# Entity Constitution

# Entity 憲章 v0.1

本文件定義：

- entity semantics
- entity lifecycle
- entity ownership
- entity streaming
- entity proxy rules
- entity/runtime relationship

本文件為：

# 世界可互動對象的語意規格來源。

---

# 1. Core Principle

Entity：

不是：

```txt
Gameplay Object
```

Entity：

為：

# 世界中的可識別 runtime interaction unit。

---

# 2. Entity Identity

所有 entity：

必須存在：

- canonical identity
- ownership
- lifecycle state
- authority boundary
- serialization identity

避免：

- duplicate entity state
- ambiguous ownership
- runtime identity drift

---

# 3. Entity Ownership

所有 entity：

必須存在：

```txt
Single Authority Owner
```

Entity：

不得被：

- renderer
- UI
- presentation layer

擁有 canonical authority。

---

# 4. Entity Lifecycle

Entity：

允許存在：

- unloaded
- instantiated
- active
- simulated
- dormant
- archived
- destroyed

等 lifecycle state。

---

# 5. Entity Streaming

Entity：

允許：

- spatial streaming
- temporal streaming
- proxy streaming
- distributed residency

Runtime：

不得假設：

```txt
所有 entity 永遠 active
```

---

# 6. Entity Proxy

Runtime：

應優先使用：

```txt
Entity Proxy
```

而非 full canonical solver state。

Entity Proxy：

必須支援：

- streaming
- deterministic runtime
- distributed synchronization
- replay
- serialization

---

# 7. Entity and Field Relationship

Entity：

允許與：

- material field
- thermal field
- structural field
- biological field

互動。

Entity：

不得假設：

```txt
世界只由 discrete object 構成
```

---

# 8. Gameplay Separation

Gameplay：

不得直接定義 entity truth。

Gameplay：

只能：

- consume runtime representation
- request mutation
- trigger simulation interaction

---

# 9. Distributed Runtime

Distributed Runtime：

必須定義：

- entity ownership
- transfer boundary
- synchronization rule
- authority migration

避免：

```txt
Hidden distributed entity divergence
```

---

# 10. Final Principle

Entity：

不是 gameplay abstraction。

Entity：

是：

# 世界中的可互動 runtime 存在單位。
