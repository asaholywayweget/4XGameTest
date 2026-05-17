# Repository Constitution

> 本文件定義本 repository 的資產生命週期、真值來源、artifact provenance、runtime ownership、storage tier 與 reproducibility 政策。
>
> `.gitignore`、CI pipeline、artifact registry、cache policy 皆為本文件之 implementation detail。

---

# 1. Core Principles

## 1.1 Simulation-first

世界先被定義。

所有 runtime artifact：

- runtime proxy
- reduction output
- streaming chunk
- compiled field
- replay state

皆由 canonical source 推導。

Generated artifact 不得作為世界真值。

---

## 1.2 Canonical Truth Principle

世界真值（Truth）只能來自：

- canonical source
- validated schema
- deterministic simulation definition

禁止：

```txt
將 generated runtime asset 視為 canonical truth
```

---

## 1.3 Reproducibility Principle

所有 generated runtime artifact：

必須可由：

```txt
canonical source
    + schema version
    + reduction pipeline
    + build configuration
```

重新建構。

---

## 1.4 Determinism Boundary

本專案要求：

```txt
semantic determinism
```

而非必然：

```txt
bitwise determinism
```

不同平台：

- GPU vendor
- SIMD implementation
- distributed execution
- async reduction

允許存在低階數值差異。

但：

最終世界語意與驗證結果必須一致。

---

## 1.5 Validation Immutability Principle

Validation artifact 為 append-only。

已驗證結果：

不得 in-place 修改。

若需更新：

必須建立：

- 新版本
- 新 validation record
- 新 provenance chain

---

## 1.6 Distributed Runtime Principle

distributed runtime state：

- replay
- rollback
- snapshot
- runtime synchronization cache

不得作為 canonical source。

Distributed state 只能作為：

```txt
runtime operational state
```

---

## 1.7 Provenance Principle

所有 generated artifact：

必須保留 provenance metadata。

至少包含：

- source hash
- schema version
- reduction pipeline version
- compiler / solver version
- runtime version
- build configuration

禁止：

```txt
無法追溯來源的 generated artifact
```

---

## 1.8 Runtime Traceability Principle

所有 runtime state：

必須可追溯至：

- canonical source
- simulation configuration
- reduction pipeline
- runtime build
- schema version

---

## 1.9 Repository Scope Principle

repository 不是 universal storage backend。

大型 simulation artifact：

不得預設永久儲存於 git repository。

---

# 2. Asset Lifecycle

```txt
Canonical Source
    ↓
Reduction / Compilation
    ↓
Runtime Proxy
    ↓
Streaming Residency
    ↓
Ephemeral Runtime State
    ↓
Replay / Snapshot
    ↓
Validation
```

---

# 3. Asset Classification

## 3.1 Canonical Source

可進版本控制。

作為世界真值來源。

包含：

- engine source
- simulation kernel source
- solver source
- material definitions
- truth assets
- validation scenarios
- deterministic tests
- ABI schema
- scheduler graph definitions
- constitution documents
- RFC / ADR

範例路徑：

```txt
/src/
/docs/
/data/source_truth/
/validation/
/spec/
```

---

## 3.2 Generated Artifact

由 canonical source 經 build / reduction pipeline 產生。

不得作為真值。

必須可重建。

包含：

- compiled runtime proxy
- reduced simulation output
- runtime field bake
- thermal reduction
- orbital LUT
- voxel proxy
- mesh reduction
- shader intermediate
- GPU pipeline artifact

範例路徑：

```txt
/generated_runtime/
/compiled_proxy/
/runtime_bake/
/reduction_output/
/shader_cache/
```

---

## 3.3 Runtime Ephemeral Data

runtime operational state。

local-only。

不應提交。

包含：

- replay temp
- runtime snapshot
- rollback cache
- local residency cache
- simulation trace
- sync log
- runtime profiling data

範例路徑：

```txt
/replays/
/snapshots/
/rollback_cache/
/runtime_trace/
/sync_logs/
/profiling/
```

---

## 3.4 Validation Artifact

validation result 為 immutable artifact。

驗證通過後：

不得覆蓋。

包含：

- deterministic validation
- orbital stability validation
- thermal validation
- structural validation
- replay verification
- synchronization verification

範例路徑：

```txt
/validation/
/data/validation_assets/
```

---

# 4. Ownership Classification

| Asset Type | Authority |
|---|---|
| canonical source | repository |
| generated artifact | build pipeline |
| runtime cache | local runtime node |
| replay snapshot | runtime authority node |
| distributed state | distributed authority layer |
| validation artifact | validation pipeline |

---

# 5. Storage Tier Principle

simulation infrastructure 可使用多層 storage。

包含：

| Tier | 用途 |
|---|---|
| source repository | canonical source |
| artifact registry | generated runtime artifact |
| distributed cache | runtime operational cache |
| CDN | streaming chunk / terrain tile |
| object storage | thermal / orbital / FEM cache |
| cold archive | immutable validation artifact |

---

# 6. Schema Governance

所有 persistent simulation schema：

必須：

- versioned
- traceable
- migratable

禁止：

```txt
未版本化 persistent schema
```

---

## 6.1 Schema Migration Principle

schema 更新：

必須包含：

- migration policy
- backward compatibility policy
- validation strategy

---

# 7. Repository Layout Principle

repository layout 必須反映 simulation lifecycle。

禁止：

```txt
將所有 asset 混入單一 Assets/ 目錄
```

建議結構：

```txt
/src/
/docs/
/spec/
/data/source_truth/
/generated_runtime/
/runtime_cache/
/validation/
/replays/
/snapshots/
```

---

# 8. Git Policy

`.gitignore`：

不得定義 architecture policy。

其責任僅為：

- 防止 generated artifact 汙染 repository
- 防止 runtime ephemeral data 被提交
- 保持 deterministic repository state

---

# 9. Future Separation Strategy

當 generated artifact 超出 git repository 合理範圍時：

必須分離至外部 storage infrastructure。

例如：

| 類型 | 建議儲存 |
|---|---|
| runtime bake | artifact server |
| streaming terrain chunk | CDN |
| thermal / FEM cache | object storage |
| distributed replay archive | cold storage |
| orbital reduction dataset | large-scale archive |

source repository：

只保留：

- canonical source
- schema
- runtime source
- validation definition
- constitution / RFC / ADR

---

# 10. Final Principle

本 repository 的核心目的不是：

```txt
儲存所有 runtime 結果
```

而是：

```txt
維持可驗證、可追溯、可重建、可分散式擴充的 simulation source infrastructure
```

---

# 11. Revision History

| Version | Description |
|---|---|
| v0.1 | 初始 lifecycle 與 asset classification |
| v0.2 | 新增 determinism boundary、provenance、ownership、storage tier、schema governance、traceability |
