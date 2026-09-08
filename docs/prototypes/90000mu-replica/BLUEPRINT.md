# Project 90K-Mu — 《九萬畝》玩法復刻原型藍圖

> 狀態：Blueprint / Architecture Only
>
> 更正：`九萬畝`是遊戲名稱，不是把「九萬畝」換算成 60 km² 的大世界專案。
>
> 本專案目標是做一個 **玩法與系統結構導向的復刻原型**：重建《九萬畝》這類 2D 格網 SLG 的領地、城市、軍隊、行軍、戰鬥、資源與多人框架；不複製原作美術、音效、程式碼或私有資料。

---

# 0. 目前可確認的遊戲輪廓

根據官方商店頁、公開攻略與遊戲截圖，可先確認以下核心：

- 2D / 像素風格格網世界地圖
- 從小領地開始向外擴張
- 地塊具有所有權與資源價值
- 城市 / 主城與多種建築升級
- 軍隊編成、兵種、英雄 / 武將
- 多支隊伍行軍
- 攻地、守地、攻城
- 聯盟 / 支援 / 多人對抗
- 科技 / 政策 / 裝備等長期成長
- 戰鬥帶有自動結算 / 自走式成分
- 要塞等前線設施可改變行軍與戰略

公開資料還可看到：

- 玩家領地可形成「蚊香陣 / 護城河」等幾何防禦
- 城附近存在方向性防守與砲台概念
- 橋頭、季節地圖、交戰中地塊狀態等規則存在
- 遠征 / 前線重點是路徑、支援、阻斷與時間成本

本文件把「已確認」與「待逆向驗證」分開，不把猜測寫死成規則。

---

# 1. 復刻目標

第一版不追求 1:1 UI 或美術。

先復刻以下 **可驗證玩法閉環**：

```text
出生 / 主城
    ↓
佔領相鄰土地
    ↓
取得資源
    ↓
升級城市 / 科技
    ↓
編成軍隊
    ↓
跨地塊行軍
    ↓
與野地 / 玩家接觸
    ↓
自動戰鬥 / 攻城
    ↓
土地歸屬改變
    ↓
前線擴張 / 防守 / 支援
```

成功標準不是畫面像，而是：

- 地圖與領地規則成立
- 行軍與阻斷成立
- 多隊伍可同時運作
- 戰鬥結果可重播 / 驗證
- 城市與經濟形成回饋
- 後續能接多人而不重寫核心

---

# 2. 頂層架構

```text
Client Host
├─ Map Renderer
├─ UI / Input
├─ Animation / VFX
└─ Audio
        │
        ▼
Presentation Bridge
        │
        ▼
Simulation Runtime
├─ MatchSystem
├─ WorldGrid
├─ TerritorySystem
├─ CitySystem
├─ EconomySystem
├─ ArmySystem
├─ MarchSystem
├─ CombatSystem
├─ ResearchPolicySystem
├─ AllianceSystem
├─ EventSystem
├─ Snapshot / Replay
└─ Validation
        │
        ▼
Data Layer
├─ Ruleset
├─ Unit Definitions
├─ Building Definitions
├─ Map Seed / Map Data
└─ Save / Match State
```

## 強制邊界

- Simulation Runtime 不依賴 Unity / Godot / Web DOM
- UI 不直接修改 WorldGrid
- Renderer 不擁有遊戲真實狀態
- 戰鬥只輸出事件 / 狀態差異，不直接控制特效
- 所有規則由 Ruleset / Definitions 資料驅動
- 伺服器版與本地版使用同一套 Simulation Core

---

# 3. WorldGrid — 世界不是 Scene，而是資料

原型核心採規則化 2D Grid。

```text
WorldGrid
    Cell[x,y]
```

地圖尺寸不得寫死；例如：

```text
Debug      32 × 32
Prototype 128 × 128
Stress    600 × 600
```

600 × 600 只有 360,000 個 Cell，對資料導向實作並不大；真正成本來自每格若掛大量物件、腳本與渲染節點。

因此 Cell 使用緊湊資料：

```text
Cell
- TerrainType
- OwnerId
- OccupationState
- ResourceType
- ResourceLevel
- StructureId
- MarchFlags
- CombatFlags
- RuleFlags
```

不為每格建立 GameObject / Node。

## Chunk

Renderer / Network / Persistence 再把 Grid 分 Chunk：

```text
16×16 或 32×32 Cell / Chunk
```

Chunk 是載入、渲染、同步與 dirty tracking 單位；不是遊戲規則單位。

---

# 4. TerritorySystem — 「打地」是核心系統

土地不是裝飾，而是一個狀態機。

初始候選：

```text
Neutral
Claimable
Marching
Contested
Owned
Truce / Protected
Blocked
Special
```

領地擴張規則需支援：

- 鄰接條件
- 所有權
- 地塊等級
- 攻佔耗時
- 戰鬥
- 免戰 / 保護
- 被切斷後的處理
- 城池陷落後的領地連鎖變更

## 為什麼這個模組要先做

公開攻略中的蚊香陣、護城河陣、雙路 / 三路進攻，都依賴 **土地幾何與連通性本身就是戰術**。

所以不能把土地當成單純背景 Tilemap。

---

# 5. CitySystem

城市先拆成「戰略資料」與「畫面布局」兩層。

```text
CityState
- Owner
- Level
- HP / Defense
- BuildingLevels[]
- Storage
- Production
- Garrison
- ConstructionQueue
- ResearchQueue
```

可能建築類型先按公開資料抽象：

- 主城 / 根城
- 研究所
- 兵營
- 鍛造 / 裝備
- 倉庫 / 糧倉
- 城牆 / 防禦
- 大使館 / 聯盟設施
- 英雄相關建築
- 前線要塞

具體名稱與數值最後再依遊戲內實測校正。

## 城戰

城本體不應只是「高 HP 地塊」。

預留：

```text
CityCombatProxy
- Entry directions
- Defensive emplacements
- Garrison slots
- Siege progress
- Capture condition
```

這可支援公開攻略提及的「方向進場」「城周圍防禦」「砲台」等機制。

---

# 6. Army / Formation

資料層先拆：

```text
Army
- ArmyId
- OwnerId
- Hero / Commander
- FormationId
- State
- CurrentCell
- TargetCell
- PathHandle
- MarchProgress
- Supply / Morale (optional)

Formation
- Troop stacks / slots
- Unit type
- Level
- Equipment
- Runtime HP / count
```

不要把「軍隊」與「畫面上的像素小人」綁死。

一支 Army 在：

- 世界地圖上是一個戰略 Entity
- 戰鬥中可以展開為 Formation / Combatant
- 遠距離時只保留資料，不需要 Animator

---

# 7. MarchSystem — 行軍是時間與拓樸問題

這類 SLG 的行軍不是一般角色尋路。

需要處理：

- 可通行所有權 / 地形
- 鄰接地
- 敵我接觸
- 橋 / 特殊通路
- 行軍時間
- 多隊列
- 中途阻斷
- 目的地被奪取
- 途中遭遇
- 撤退 / 遣返
- 要塞縮短前線距離

## 尋路分層

```text
Strategic Graph
    ↓
Cell Path
    ↓
March Timeline
```

不要每 Tick 重跑 A*。

路徑建立後保存 `PathHandle`；只有拓樸 / 目標 / 規則變更時才重新規劃。

---

# 8. CombatSystem — 先做 deterministic 自動戰鬥

原作宣傳有「回合自走棋」描述，因此復刻核心應把戰鬥做成獨立 deterministic resolver。

```text
CombatInput
- Seed
- Army A
- Army B
- Terrain / City modifiers
- Initial positions

CombatResolver
    ↓
CombatEventStream
    ↓
CombatResult
```

事件例如：

```text
Move
TargetAcquire
Attack
Damage
SkillCast
StatusApply
Death
Retreat
Victory
```

Client 只播放 EventStream。

好處：

- 可 Replay
- 可 Server-authoritative
- 可做加速播放
- 可做戰報
- 可單元測試
- 不受 FPS 影響

## 第一版戰鬥

不急著復刻全部兵種。

只做：

```text
Shield
Melee
Ranged
Cavalry
Siege
```

先驗證克制、射程、目標選擇、碰撞 / 隊列與撤退。

---

# 9. Economy / Progression

先以資料表驅動：

```text
Resource
- Food
- Wood
- Stone
- Gold / Currency
```

系統：

- 地塊產出
- 城市建築產出
- 倉儲上限
- 建築升級成本
- 訓練成本
- 研究成本
- 時間佇列

不要把數值硬寫在 UI。

所有公式進：

```text
Ruleset/*.json
```

或日後編譯成 binary data。

---

# 10. Multiplayer 從一開始預留，但不先做

架構採：

```text
Command
    ↓
Authoritative Simulation
    ↓
Event / State Delta
    ↓
Clients
```

例如：

```text
ClaimLandCommand
MarchArmyCommand
BuildCommand
ResearchCommand
AttackCommand
```

Client 不送「我的軍隊現在在 x=153.27」。

Client 只送意圖；Simulation 決定結果。

這能自然支援：

- Replay
- Spectator
- reconnect
- cheat resistance
- dedicated server

---

# 11. 視覺層

第一輪直接使用自製代表色，不碰原作素材。

```text
Grass      淺綠
Owned land 玩家色半透明框 / 填色
Enemy land 敵方色
Water      藍
Rock       灰
Resource   簡單 icon / shape
City       自製 pixel proxy
Army       自製棋子 / sprite
March      procedural line / arrow
```

UI 只先做：

- Map viewport
- Cell inspector
- Army inspector
- City panel
- March command
- Build / recruit
- Debug timeline

像素風格可以最後再做，不讓美術阻塞規則驗證。

---

# 12. 技術候選

## 主方案 A — Web 快速驗證

```text
TypeScript
+ PixiJS / Phaser
+ Web Worker
+ optional WebGPU
```

用途：

- 地圖與規則最快可視化
- 手機 / PC 都容易預覽
- 適合先驗證打地、領地、行軍、戰鬥

限制：

- 最終大型 Server / 高負載 Simulation 可能需拆出 native / C# core

## 主方案 B — C# 長期 Runtime

```text
.NET / C# Simulation Core
+ Unity Host 或 Godot Host
```

優點：

- 適合長期 deterministic simulation
- 與目前 4XGameTest 架構方向一致
- 未來可直接做 dedicated server

Unity / Godot 僅負責 Client / Presentation。

## 工具

- Blender：只有需要 3D / UI mockup / icon pipeline 時使用，本案不是必要核心
- Aseprite：像素美術；付費但價格低
- LibreSprite：免費替代
- Krita / GIMP：免費 2D
- Tiled：免費 Tilemap / map authoring
- LDtk：免費 / 輕量 level data authoring
- SQLite：本地規則 / 測試資料 / replay 索引
- Python：資料生成、數值平衡、戰鬥批次 Monte Carlo

## 不建議第一階段

- Unreal：對這個 2D 格網 SLG 過重
- Blender-first：問題核心不是 3D 資產
- 大型商業後端：還沒必要

---

# 13. 建議實作順序

## Phase 0 — Reference Lock

只研究，不寫玩法大系統。

蒐集並標記：

- 世界地圖尺寸 / 視口
- 地塊種類
- 所有權規則
- 主城尺寸
- 行軍規則
- 戰鬥進入條件
- 兵種與編成
- 資源
- 建築
- 政策 / 科技
- 聯盟支援

每一項標記：

```text
VERIFIED
OBSERVED
INFERRED
UNKNOWN
```

避免把猜測變規格。

## Phase 1 — Grid + Territory

做：

- 32×32 地圖
- Cell data
- 中央主城
- 鄰接打地
- Owner color
- 地塊資源

驗證：

- 可以形成蚊香 / 護城河型領地
- 不能非法跳地

## Phase 2 — Army + March

做：

- 3 支隊伍
- path cache
- march timeline
- 中途阻斷
- 多路線進軍

驗證：

- A* 不每幀重算
- 改變拓樸才重算

## Phase 3 — Deterministic Combat

做：

- 5 類兵種
- 自動戰鬥
- event stream
- replay

驗證：

```text
same input + same seed = same hash
```

## Phase 4 — City / Economy

做：

- 主城
- 兵營
- 研究
- 三種主要資源
- queue
- 要塞

形成完整局內循環。

## Phase 5 — 128×128 Match

整合：

- 多玩家 AI
- 領地擴張
- 前線
- 城戰
- 支援
- 戰報

## Phase 6 — 600×600 Stress

不是把 360k 個 Tile 畫成 360k 個 Object。

測試：

- Grid memory
- Chunk renderer
- dirty updates
- 100 / 1k / 10k armies
- path request queue
- replay size

## Phase 7 — Multiplayer

先 2–8 client local server，再擴大。

---

# 14. 第一批測試

```text
TerritoryAdjacencyTest
TerritoryCaptureTest
TruceCellTest
PathInvalidationTest
MultiArmyMarchTest
EncounterTriggerTest
CombatDeterminismTest
CityCaptureOwnershipCascadeTest
SaveReloadHashTest
600x600GridMemoryTest
```

---

# 15. 下一次有電腦時只做這些

不要直接生成完整遊戲。

第一個可執行里程碑：

```text
[1] WorldGrid 32×32
[2] 一座中央主城
[3] 玩家點擊相鄰地塊佔領
[4] 地塊變成玩家色
[5] 一支 Army 可從主城走到己方土地
[6] path cache 可視化
[7] 所有操作寫入 Command/Event log
[8] Save → Reload 後 hash 相同
```

這 8 項穩定後才做戰鬥。

---

# 16. 研究來源（初步）

- Google Play / App Store 官方《九萬畝》頁面
- 巴哈姆特《九萬畝》攻略與打地攻略
- Gamerch 九万畝攻略 Wiki
- 公開 Gameplay / 攻略影片

後續真正復刻時，以實際遊戲錄屏逐格建立 reference matrix；公開攻略只作輔助，不直接當成最終規則。

---

這份藍圖的核心是：**先復刻「領地拓樸 + 行軍時間 + 自動戰鬥 + 城市經濟」四個相互咬合的系統，而不是把《九萬畝》理解成一張九萬畝大的 3D 地圖。**
