# Canonical Document Registry

# 正式規格文件索引 v0.1

本文件定義：

- Canonical Documents
- Constitution Layer
- RFC Layer
- ADR Layer
- Engineering Specification Layer
- Experimental Layer

本文件為：

# Simulation-first Framework 的正式規格索引。

---

# 1. Constitution Layer

Constitution：

定義不可輕易違反的世界規則。

## Active Canonical Constitutions

| Document | Status | Scope |
|---|---|---|
| world_constitution.md | Canonical | 世界基礎語意與 Simulation-first 原則 |
| specification_governance.md | Canonical | 規格治理與文件分層 |
| authority_constitution.md | Canonical | 世界 authority 與 mutation 規則 |
| spatial_constitution.md | Canonical | 多尺度空間與 precision 規則 |

---

# 2. Planned Constitutions

以下文件尚未建立：

| Document | Planned Scope |
|---|---|
| simulation_clock.md | 多時間尺度與 tick 規則 |
| scheduler_constitution.md | simulation scheduling 與 dependency governance |
| simulation_abi.md | runtime ABI 與資料 layout |
| material_constitution.md | Unified Material Runtime semantics |
| runtime_constitution.md | Runtime approximation 與 residency rules |
| validation_constitution.md | 世界合法性與 validation authority |
| glossary.md | 統一世界語意字典 |

---

# 3. RFC Layer

RFC：

定義可演化工程設計。

目前：

```txt
尚未建立 RFC 文件。
```

預計：

- material_ir_rfc.md
- runtime_proxy_rfc.md
- field_streaming_rfc.md
- deterministic_runtime_rfc.md
- chunk_ownership_rfc.md

---

# 4. ADR Layer

ADR：

記錄不可逆設計決策。

目前：

```txt
尚未建立 ADR 文件。
```

未來：

- runtime_approximation_adr.md
- renderer_observer_adr.md
- no_global_float_coordinates_adr.md
- eventbus_restriction_adr.md

---

# 5. Engineering Specification Layer

Engineering Specification：

定義 implementation contract。

目前：

```txt
尚未建立正式 Engineering Specifications。
```

---

# 6. Experimental Layer

Experimental Draft：

允許：

- speculative runtime
- prototype simulation
- unstable architecture experiment

Experimental 文件：

不得直接成為 canonical runtime foundation。

---

# 7. Final Principle

所有 implementation：

應引用：

# Canonical Documents

作為語意來源。

禁止：

```txt
Implementation 自行定義世界語意
```
