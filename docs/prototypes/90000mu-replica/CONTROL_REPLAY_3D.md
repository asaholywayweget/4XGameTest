# 90K-Mu — Admin Console / Battle Report / 3D Migration Spec

> Scope: 補充《九萬畝》玩法復刻原型的三個長期需求：
>
> 1. P 社式管理員 / 除錯 / 金手指控制台
> 2. 戰報條目與可復盤 Replay
> 3. 未來 2D → 3D 的 Presentation / Asset 遷移

---

# 1. Admin / Debug / Cheat Console

此系統不是單純「作弊輸入框」，而是 Simulation Runtime 的受控操作介面。

## 1.1 模式

```text
PlayerMode
DebugMode
CheatMode
GMMode
```

### PlayerMode
- 無管理權限
- 只能使用正常遊戲 Command

### DebugMode
- 讀取狀態
- 顯示 Cell / Army / City / Combat 內部資料
- 顯示 path / event / tick / seed / owner / flags
- 原則上不改變世界狀態

### CheatMode
- 單機或測試環境使用
- 可注入受控 Command
- 例如資源、時間、部隊、領地、建築、科技

### GMMode
- 伺服器管理使用
- 需要權限與 Audit Log
- 所有操作必須留下：操作者、時間、命令、參數、前後狀態摘要

## 1.2 Console Architecture

```text
Console UI
    ↓
Command Parser
    ↓
Permission Gate
    ↓
AdminCommandRegistry
    ↓
Simulation Command Bus
    ↓
Authoritative Simulation
    ↓
Event Log / Audit Log
```

Console 不得直接修改 `WorldGrid[x,y]` 或物件欄位。

錯誤方式：

```text
cell.OwnerId = 1
```

正確方式：

```text
ForceSetOwnerCommand(cellId, playerId)
```

這樣 Cheat / GM 操作也能：

- Replay
- Undo / rollback（若規則允許）
- 記錄
- Multiplayer audit
- 單元測試

## 1.3 初始命令族

```text
world.inspect x y
world.reveal all
world.set_owner x y player
world.set_state x y state

army.spawn owner x y template
army.move armyId x y
army.kill armyId
army.set_hp armyId value
army.set_speed armyId multiplier

city.spawn owner x y template
city.level cityId level
city.damage cityId value

resource.add player food 10000
resource.set player wood 999999

research.unlock player techId
research.complete player techId

time.pause
time.scale 10
time.step 1

combat.start armyA armyB
combat.inspect combatId
combat.replay combatId

ai.enable faction
ai.disable faction
ai.step faction

sim.hash
sim.snapshot saveName
sim.load saveName
sim.verify
```

## 1.4 Debug Overlay

畫面層另外提供 Overlay，不與 Console 綁死：

- Cell ID / Chunk ID
- Ownership
- Territory connectivity
- Path graph
- Army state
- Target / current command
- Combat trigger radius
- Simulation tick
- RNG seed
- Event queue
- Dirty chunks
- Entity count
- CPU budget

Debug Overlay 只能讀 Diagnostics API。

---

# 2. Battle Report + Replay

目標不是只有「勝 / 負 + 傷兵數」。

要做成類似《三國志戰略版》或《信長之野望 真戰》那種可翻閱條目，再進一步支援完整復盤。

## 2.1 三層資料

```text
BattleSummary
    ↓
BattleTimeline
    ↓
Deterministic Replay Data
```

### BattleSummary
給列表頁：

```text
BattleId
Timestamp
Location
Attacker
Defender
Result
DurationTicks
InitialStrength
FinalStrength
Losses
Rewards / TerritoryChange
ImportantTags
```

### BattleTimeline
給文字戰報：

```text
Tick 100  A 軍進入接敵
Tick 104  B 弓兵鎖定 A 前排
Tick 110  技能 X 發動
Tick 112  A 前排受到 230 傷害
Tick 130  B 左翼潰退
Tick 180  A 勝利
```

條目可分：

- Movement
- Attack
- Damage
- Skill
- Buff / Debuff
- Formation
- Death / Rout
- Reinforcement
- Siege
- Ownership change

### Deterministic Replay Data
最低需求：

```text
RulesetVersion
SimulationVersion
Seed
InitialSnapshot / SnapshotRef
InputCommands
CombatEventStream
FinalStateHash
```

只要相同版本與輸入可以重新跑出同樣的 `FinalStateHash`，就能真正復盤，而不是播放錄影。

## 2.2 戰報 UI

```text
Battle Report List
├─ 日期 / 時間
├─ 地點
├─ 對手
├─ 結果
├─ 傷亡摘要
└─ Tags

Battle Detail
├─ 雙方編成
├─ 初始 / 最終兵力
├─ Timeline 條目
├─ 傷害來源統計
├─ 技能使用統計
├─ 傷亡分布
├─ 地形 / 城防修正
└─ [Replay]
```

Replay Viewer：

```text
Play / Pause
0.25x / 0.5x / 1x / 2x / 4x / 8x
Step Tick
Jump to Event
Filter Event Type
Select Unit
Inspect State
```

這個 Viewer 同時也是 Validator 工具。

---

# 3. Event Sourcing Boundary

建議把「戰報」建立在既有 EventSystem 上，而不是做第二套紀錄系統。

```text
Simulation Command
    ↓
System Update
    ↓
Domain Event
    ├─ Presentation
    ├─ Battle Report
    ├─ Replay
    ├─ Analytics
    └─ Audit
```

需要區分：

```text
DomainEvent     世界真的發生了什麼
VisualEvent     Client 要播什麼特效
DebugEvent      開發診斷資訊
AuditEvent      GM / 管理操作紀錄
```

不可把粒子特效、動畫 trigger 當成戰鬥真實紀錄。

---

# 4. Future 3D Migration

2D 與 3D 必須共享同一個 Simulation State。

不要在 3D 化時把 2D 專案重寫一次。

## 4.1 Presentation Adapter

```text
Simulation Runtime
      ↓
Presentation Snapshot
      ↓
+----------------------+----------------------+
| 2D Renderer          | 3D Renderer          |
| Pixi / Unity 2D      | Unity / Godot / UE   |
+----------------------+----------------------+
```

Simulation 只暴露：

```text
CellState
ArmyState
CityState
MarchState
CombatState
PresentationHints
```

3D Host 自己決定：

- Mesh
- Material
- Animator
- Particle
- Camera
- LOD
- Shadow

## 4.2 2D → 3D 不直接替換 Cell

建議保留戰略 Grid 作為 Logical Layer：

```text
Logical Cell
    ↓
Terrain Patch / Decal / Mesh

Army Entity
    ↓
3D Formation Proxy

City State
    ↓
3D City Representation
```

也就是 3D 化只是 Representation 升級，不修改規則座標。

## 4.3 Blender Pipeline

Blender 用於：

- Modular building pieces
- Unit proxy
- LOD0/1/2/3
- Collision proxy
- Socket / attachment points
- Batch export
- Geometry Nodes 程序化變體

資產 metadata 不寫死在 Blender scene；輸出成獨立資料：

```text
AssetId
ModelPath
LODGroup
CollisionProfile
SocketSet
FactionVariant
ScaleProfile
MaterialSet
```

## 4.4 3D 地圖模式

預留三種 Camera / Render Profile：

```text
Strategic2D
Tactical3D
Cinematic3D
```

Strategic2D：
- 原始九萬畝式玩法
- 最低成本
- 大尺度資訊最清楚

Tactical3D：
- 斜視 / 等距 / 自由旋轉
- 部隊與城市有實際 Mesh
- 邏輯仍在格網

Cinematic3D：
- 戰報復盤或近距離觀看
- 高品質動畫 / VFX
- 不承擔世界權威 Simulation

---

# 5. Unity 畫面鋸齒問題：架構上的處理

Unity 本身不是「特別容易產生鋸齒」，但預設專案常因渲染設定、解析度與抗鋸齒策略不匹配而很明顯。

常見來源：

1. 幾何邊緣 rasterization aliasing
2. 低 Render Scale / Dynamic Resolution
3. MSAA 未開或 Renderer 不適用 MSAA
4. 細線 / 欄杆 / 遠距建築產生 sub-pixel shimmer
5. Alpha-cutout 植被與透明材質 aliasing
6. Texture 沒 mipmap 或 filtering 不合適
7. Shadow map resolution / cascade aliasing
8. 2D sprite 非整數 pixel scaling
9. Camera 在像素格間移動導致 sprite shimmer

## 5.1 抗鋸齒不是單一開關

大致分工：

```text
MSAA  → 幾何邊緣好，對 shader / temporal shimmer 幫助有限
FXAA  → 便宜，但容易糊
SMAA  → 靜態邊緣品質通常比 FXAA 好
TAA   → 對移動時閃爍 / sub-pixel 很有效，但可能 ghosting / 柔化
SSAA  → 品質高但成本高
```

所以未來 3D Host 要把 AA 做成 RenderProfile，而不是硬編碼。

## 5.2 對本專案的建議

### Strategic2D

若維持像素風格：

- Point filtering
- Pixel-perfect camera
- 固定 Pixels Per Unit
- 整數倍縮放
- Camera pixel snapping
- 不使用 TAA 去模糊 pixel art

若不是像素風，而是平滑 2D：

- Bilinear / mipmap
- 高解析 UI / vector-like shapes
- SMAA / FXAA 視平台選擇

### Tactical3D

優先：

```text
Native resolution
+ mipmaps
+ anisotropic filtering
+ reasonable shadow cascades
+ TAA or SMAA
```

近距離大量細節時才考慮 MSAA / higher render scale。

### Cinematic3D

可以接受較昂貴方案：

- TAA
- higher internal render scale
- temporal accumulation
- higher shadow resolution
- optional supersampling for replay capture

---

# 6. 建議新的模組

```text
src/
  Admin/
    AdminCommandRegistry
    PermissionPolicy
    AuditLog

  Diagnostics/
    DiagnosticsSnapshot
    DebugOverlayBridge

  Reports/
    BattleReportIndex
    BattleSummaryBuilder
    BattleTimelineBuilder

  Replay/
    ReplayRecorder
    ReplayPlayer
    ReplayValidator

  Presentation/
    PresentationSnapshot
    PresentationHints
    IRenderAdapter
```

這些都不應依賴 Unity。

---

# 7. 實作順序

不要一次把控制台、戰報、3D 都做完。

## Stage A
- `CommandBus`
- `EventBus`
- `AdminCommandRegistry`
- `time.pause / time.step / world.inspect`

## Stage B
- CombatEventStream
- BattleSummary
- BattleTimeline
- 戰報列表

## Stage C
- Deterministic Replay
- Hash validation
- Replay Viewer

## Stage D
- 2D Presentation Adapter 固化
- `PresentationSnapshot`

## Stage E
- Blender 資產 pipeline
- 3D Prototype Adapter
- 一個 Cell + 一支 Army + 一座 City 的 3D 表現驗證

通過後才擴張到完整 3D 戰略地圖。
