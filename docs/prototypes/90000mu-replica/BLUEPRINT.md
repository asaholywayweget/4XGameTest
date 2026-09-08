# Project 90K-Mu — 九萬畝 3D 復刻原型藍圖

> 狀態：Blueprint / Architecture Only
>
> 目的：先建立可驗證、可分階段擴充的 3D 大世界復刻原型，不直接把專案做成單體遊戲工程。

## 0. 面積與本階段假設

「九萬畝」先按字面面積處理：

- 90,000 畝 ≈ 60,000,000 m²
- 即約 60 km²
- 邏輯世界先採 10 km × 6 km = 60 km²

本原型的「復刻」定義為：

- 復刻畫面類型、鏡頭感、場景密度、世界串流與互動結構
- 不直接複製第三方遊戲資產、貼圖、模型或受保護關卡資料
- 初期全部使用自製 Graybox / 代表色 / 程序化幾何

## 1. 核心目標

建立一個能逐步長成大型 3D 模擬世界的原型，最終可承載：

- 60 km² 大世界
- 城市 / 郊區 / 地形混合
- 第三人稱或自由鏡頭
- 動態日照與基本天候
- 可串流建築、道路、植被、道具
- 大量背景代理 Entity
- 小範圍高精度物理
- RTS / 單位 / AI / 多人同步的後續接入

核心不是「先把畫面做漂亮」，而是先證明：

1. 世界可切分
2. Chunk 可載入 / 卸載
3. Simulation state 與 Render state 分離
4. 跨 Chunk 可穩定移動
5. 大量物件不需要全部以高精度存在
6. 後續可替換 Renderer / Engine Host

## 2. 世界分層

```text
World: 10 km × 6 km
│
├─ Region: 2 km × 2 km
│   └─ 共 5 × 3 = 15 Regions
│
├─ Chunk: 250 m × 250 m
│   └─ 共 40 × 24 = 960 Chunks
│
├─ Local Cell / Simulation Cell
│   └─ 依系統使用 8 m / 16 m / 32 m 等不同解析度
│
└─ Local Physics Bubble
    └─ Camera / Controlled Entity 周圍約 256–512 m
```

### 座標策略

- Global World Position：FP64
- Chunk / Region Index：Integer
- Render / Physics Local Position：FP32
- 支援 Origin Shifting / Floating Origin
- 不允許 Renderer 持有世界真實權威座標

## 3. Runtime 模組邊界

```text
App / Host
│
├─ SimulationKernel
│   ├─ Fixed Tick
│   ├─ Deterministic State
│   └─ Snapshot / Replay Hash
│
├─ WorldPartition
│   ├─ Region Index
│   ├─ Chunk Index
│   └─ Spatial Ownership
│
├─ StreamingScheduler
│   ├─ Load Queue
│   ├─ Unload Queue
│   ├─ Priority
│   └─ IO Budget
│
├─ WorldState
│   ├─ Terrain State
│   ├─ Structure State
│   ├─ Entity State
│   └─ Persistent Changes
│
├─ PhysicsProxy
│   ├─ Near-field Rigid Body
│   ├─ Collision Proxy
│   └─ Sleep / Reduced Representation
│
├─ Navigation
│   ├─ Region Graph
│   ├─ Chunk Graph
│   └─ Local Nav
│
├─ RenderBridge
│   ├─ Instance Stream
│   ├─ HLOD Proxy
│   ├─ Light Data
│   └─ Camera-relative Transform
│
├─ ProceduralWorld
│   ├─ Road Generator
│   ├─ Block Generator
│   ├─ Building Grammar
│   └─ Scatter / Vegetation
│
└─ Validation
    ├─ Determinism Test
    ├─ Chunk Reload Test
    ├─ Streaming Stress Test
    └─ Performance Capture
```

### 強制依賴規則

- SimulationKernel 不依賴 Unity / Godot / Unreal / Blender
- WorldPartition 不依賴 Renderer
- Renderer 只能讀 Runtime Proxy
- Physics Engine 不是 World State 的唯一真相來源
- Engine-specific GameObject / Node / Actor 不得滲入核心資料模型

## 4. 多頻率更新

不同系統不共用一個昂貴 Tick：

```text
Global / Strategic State     1–5 Hz
Background Agents            5–10 Hz
Nearby Gameplay Agents      10–30 Hz
Local Physics               60 Hz
Rendering                   Variable / VSync
```

所有頻率由 Scheduler 控制，不以 Frame Update 直接驅動 Simulation truth。

## 5. 60 km² 場景生成策略

不手工製作 60 km²。

先建立可重複生成的 World Seed：

```text
Seed
 ↓
Region Layout
 ↓
Primary Roads / Rail / Rivers
 ↓
District Classification
 ↓
Blocks
 ↓
Lots
 ↓
Building Grammar
 ↓
Props / Vegetation / Lighting Proxy
```

城市採「規則 + 少量 Hero Asset」：

- 80–95%：程序化 / 模組化資產
- 5–20%：手工地標與關鍵區

這樣才能讓 60 km² 尺度在單人或小團隊條件下可完成。

## 6. 視覺復刻策略

第一階段只追求結構與空間感：

- 無第三方貼圖依賴
- 建築以代表色材質
- 道路 / 水體 / 植被使用簡化材質
- 動態太陽 + 陰影
- 霧 / 曝光 / 基礎後處理
- HLOD 先以 Bounding Proxy / Simplified Mesh 驗證

順序：

1. Camera framing
2. Urban massing
3. Lighting
4. Streaming continuity
5. Material refinement
6. Animation / NPC
7. VFX

## 7. Entity 與大規模單位

不讓每個遠端 NPC 都存在完整 Animator / Rigidbody。

建議 Representation Ladder：

```text
Dormant Record
 ↓
Statistical / Aggregate Agent
 ↓
Low-frequency ECS Agent
 ↓
Visible Proxy
 ↓
Full Local Entity
```

Entity 升降級由距離、重要度、可視性、互動需求決定。

## 8. 工具候選

### 建議主線：Hybrid

**核心**
- C# / .NET：Simulation Kernel、World Partition、資料編譯器

**3D Host 候選**
- Unity：最快做攝影機、場景、Editor、GPU instancing、快速驗證
- Godot：開源、可控性高，適合作為替代 Host
- Unreal Engine：高品質大場景與 World Partition 強，但核心綁定風險較高

**內容工具**
- Blender：建模、程序化 Geometry Nodes、LOD、批次工具
- Krita / GIMP：2D 與材質處理
- QGIS + GDAL：真實地形 / GIS / 高程資料處理
- MeshLab / CloudCompare：網格與點雲檢查

**程序化 / 資料處理**
- Python：離線生成器、資產檢查、資料轉換
- C++ / Rust：日後需要高效能 native module 時再導入

**Web 預覽**
- TypeScript + Three.js / Babylon.js + WebGPU
- 用於世界資料、Chunk、路網、LOD 與 debug 視覺化，不作為唯一正式 Runtime

## 9. 建議技術路線

### Route A — 最快看到成果

```text
C# Simulation Core
       ↓
Unity Host
       ↓
Blender Asset Pipeline
```

優點：
- 最容易快速做出「看得到、能走、能串流」的 3D 原型
- Editor 工具成熟
- 後續仍可把 Simulation Core 抽離

風險：
- 必須嚴格避免 MonoBehaviour / GameObject 成為核心世界資料

### Route B — 開源優先

```text
C# / C++ Simulation Core
       ↓
Godot Host
       ↓
Blender
```

優點：
- 授權與原始碼控制較自由
- 適合長期客製 Runtime

風險：
- 超大型世界與高階工具鏈可能需要自行補強

### Route C — 原生最終型

```text
C++ / Rust Simulation Runtime
       ↓
Vulkan / WebGPU / custom renderer
       ↓
Blender + 自製工具
```

只應在 A/B 已證明資料模型與世界分割正確後進行，不建議直接起步。

## 10. 分階段驗證

### Phase 0 — Architecture Contract

產物：
- 本 Blueprint
- Module ownership
- Coordinate contract
- Chunk lifecycle

驗證：
- 無 Renderer 依賴 Simulation

### Phase 1 — One Chunk

範圍：250 m × 250 m

完成：
- Camera
- 基礎地面
- 10–100 建築 proxy
- 代表色
- local physics

驗證：
- 核心座標與 Host 座標轉換

### Phase 2 — 4 × 4 Chunks

範圍：1 km × 1 km

完成：
- Chunk async load/unload
- Origin shifting
- Procedural road + building block

驗證：
- 連續移動 30 分鐘無座標漂移 / state loss

### Phase 3 — Streaming Corridor

範圍：10 km 長走廊

完成：
- HLOD
- Streaming priority
- IO budget
- pooled proxies

驗證：
- 高速穿越多 Chunk
- 無永久累積記憶體

### Phase 4 — Full 60 km² Sparse World

完成：
- 960 Chunk 世界索引
- 全圖稀疏生成
- Region-level simulation

驗證：
- 全圖可遍歷
- 未載入 Chunk 仍保留低成本世界狀態

### Phase 5 — Dense Showcase District

只挑 1–2 km² 做高密度美術與互動。

完成：
- 高品質建築
- NPC
- 車輛 / 單位
- VFX
- 可破壞或動態物理測試

### Phase 6 — Scale Tests

逐級測：

- 1,000 entities
- 10,000 entities
- 100,000 low-frequency entities

不是要求全部同時可見，而是驗證 Representation Ladder。

## 11. 第一批必做測試

1. `GlobalToLocalCoordinateTest`
2. `ChunkBoundaryCrossingTest`
3. `ChunkUnloadReloadHashTest`
4. `FloatingOriginStabilityTest`
5. `StreamingMemoryPlateauTest`
6. `DeterministicReplayTest`
7. `ProxyPromotionDemotionTest`

## 12. 完成判定

此復刻原型成功，不是看「是否有一張漂亮截圖」，而是同時達成：

- 60 km² 世界資料可存在
- 可在世界中長距離連續移動
- Chunk 能真正卸載
- Simulation State 不依賴視覺物件存活
- 局部可切換高精度物理
- 遠端 Entity 可降階
- 世界狀態可 replay / hash 驗證
- Renderer Host 可以替換而不重寫世界模型

## 13. 下一次有電腦與足夠 Token 時的實作順序

只做 Phase 1，不直接生成整個專案：

1. 建立 `WorldCoordinates` 模組
2. 建立 `ChunkId / RegionId`
3. 寫座標單元測試
4. 建立最小 `SimulationKernel`
5. 建立 Host Adapter interface
6. 選 Unity 或 Godot 做第一個 Render Host
7. 只渲染單一 250 m Chunk
8. 通過測試後才進入 Phase 2

---

本文件只固定「長期不應輕易改動的架構契約」。具體 Engine、Renderer、Physics、導航庫與資產格式均保持可替換。
