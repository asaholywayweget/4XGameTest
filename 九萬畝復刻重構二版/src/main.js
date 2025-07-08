// src/main.js
// 職責：作為遊戲的總指揮，協調所有模組，處理遊戲的核心邏輯與狀態。
// [架構升級 V48 - 變數宣告修復]
// - 修復了因遺漏 'dom' 物件宣告而導致的啟動錯誤 (ReferenceError)。
// - 將 const dom = {}; 加回全域狀態區塊，確保DOM元素快取物件被正確初始化。

import { setupFirebaseAuth } from './auth/firebaseAuth.js';
import { mapManager } from './game/mapManager.js';
import { buildingsModule } from './game/buildings.js';
import { illustratedGuideModule } from './game/illustratedGuide.js';
import { recruitModule } from './game/recruit.js';
import { troopListModule } from './game/troopList.js';
import { getSoldiersForBuilding } from './game/soldierData.js';
import { aiController } from './game/aiController.js';
import { battleMapLogic } from './game/battleMapLogic.js';

// --- 【開發模式開關】 ---
const MOCK_MODE = true;

// --- 全域狀態 ---
let db, currentUser;
let playersData = [];
let worldMapGrid = [];
let worldMapMarches = [];
let currentMapType = 'worldMap';
let currentCityData = null;
let currentResourceBattle = null;
let activeBattles = {};
let playerCityCoordinates = [];
let goBackCityIndex = 0;
let activeAnimations = [];
let isActionInProgress = false;
let currentSelectedMarch = null;

// --- DOM 元素快取 ---
const dom = {};

// --- 城市模板定義 ---
const CITY_TEMPLATE = {
    name: '主城',
    gridSizeX: 17,
    gridSizeY: 17,
    placedBuildings: [{ name: "主城", row: 8, col: 8, level: 1 }],
    teams: [],
    preTrainingQueue: {},
    deployedUnits: [],
    structures: [{
        id: 'wall_A', type: 'wall', ownerId: null,
        maxHp: 200, currentHp: 200,
        gates: [{x: 8, y: 5}, {x: 8, y: 11}, {x: 5, y: 8}, {x: 11, y: 8}],
        targetPoint: {x: 8, y: 11},
        bounds: { minX: 5, maxX: 11, minY: 5, maxY: 11 },
        tag: 'building', ap: 5, attackRange: 6
    }],
    MAIN_CITY_MIN_ROW: 6, MAIN_CITY_MAX_ROW: 10,
    MAIN_CITY_MIN_COL: 6, MAIN_CITY_MAX_COL: 10,
};

function createNewCityInstance(template, ownerId, cityName = '主城') {
    const newCity = JSON.parse(JSON.stringify(template));
    newCity.id = `city_${crypto.randomUUID()}`;
    newCity.ownerId = ownerId;
    newCity.name = cityName;
    newCity.structures.forEach(s => s.ownerId = ownerId);
    return newCity;
}

// --- 種子化隨機數生成器 ---
class SeededRandom {
    constructor(seed) { this.seed = this.hashString(seed.toString()); }
    hashString(str) { let hash = 0; for (let i = 0; i < str.length; i++) { const char = str.charCodeAt(i); hash = (hash << 5) - hash + char; hash |= 0; } return hash; }
    next() { this.seed = (this.seed * 9301 + 49297) % 233280; const result = (this.seed + 233280) % 233280; return result / 233280.0; }
    nextInt(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
}

// --- 輔助函式 ---
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = `fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[9999] transition-all duration-300 ease-out text-white`;
        if (type === 'error') { messageBox.classList.add('bg-red-600'); }
        else if (type === 'success') { messageBox.classList.add('bg-green-600'); }
        else { messageBox.classList.add('bg-blue-600'); }
        messageBox.classList.add('opacity-100');
        setTimeout(() => { messageBox.classList.remove('opacity-100'); }, 3000);
    }
}

function getCurrentPlayer() {
    if (!currentUser) return null;
    return playersData.find(p => p.id === currentUser.uid);
}

// --- 世界地圖生成 ---
function generateWorldMapData(players, gameSeed, currentUserId) {
    console.log(`正在執行基於種子碼的世界生成... 種子: ${gameSeed}`);
    const prng = new SeededRandom(gameSeed);
    const gridSize = 60;
    const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(null));
    const occupiedCoords = new Set();
    const resourceTypes = ['resource-food', 'resource-wood', 'resource-stone'];
    resourceTypes.forEach(type => { const clusterCount = prng.nextInt(8, 12); for (let i = 0; i < clusterCount; i++) { let coreR = prng.nextInt(0, gridSize - 1); let coreC = prng.nextInt(0, gridSize - 1); const clusterSize = prng.nextInt(15, 30); for (let j = 0; j < clusterSize; j++) { const r = Math.max(0, Math.min(gridSize - 1, coreR + prng.nextInt(-3, 3))); const c = Math.max(0, Math.min(gridSize - 1, coreC + prng.nextInt(-3, 3))); if (!grid[r][c]) { grid[r][c] = { type: type, level: prng.nextInt(1, 5) }; } } } });
    for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { if (!grid[r][c]) { const randomType = resourceTypes[prng.nextInt(0, resourceTypes.length - 1)]; grid[r][c] = { type: randomType, level: prng.nextInt(1, 3), ownerId: null }; } } }
    const citySize = 2;
    const findSafeSpawnPoint = () => { let attempts = 0; while (attempts < 1000) { const r = prng.nextInt(0, gridSize - citySize); const c = prng.nextInt(0, gridSize - citySize); let isSafe = true; for (let i = -8; i < citySize + 8; i++) { for (let j = -8; j < citySize + 8; j++) { const checkR = r + i; const checkC = c + j; if (checkR < 0 || checkR >= gridSize || checkC < 0 || checkC >= gridSize) continue; if (occupiedCoords.has(`${checkR},${checkC}`)) { isSafe = false; break; } const tileUnder = grid[checkR][checkC]; if (tileUnder && resourceTypes.includes(tileUnder.type) && tileUnder.level > 3) { isSafe = false; break; } } if (!isSafe) break; } if (isSafe) return { row: r, col: c }; attempts++; } return { row: 0, col: 0 }; };

    players.forEach(player => {
        player.cities.forEach(city => {
            const spawnPoint = findSafeSpawnPoint();
            city.worldMapPosition = spawnPoint;
            let cityType = (player.id === currentUserId) ? 'city-own' : 'city-neutral';
            Object.assign(city, { type: cityType, ownerName: player.name, isMultiTileCity: true, mainCityOriginRow: spawnPoint.row, mainCityOriginCol: spawnPoint.col });

            for (let i = 0; i < citySize; i++) {
                for (let j = 0; j < citySize; j++) {
                    const r = spawnPoint.row + i;
                    const c = spawnPoint.col + j;
                    const originalTile = grid[r][c];

                    let tileObject;
                    if (i === 0 && j === 0) {
                        tileObject = city;
                    } else {
                        tileObject = { ...originalTile, isOccupiedByCity: true, cityOriginRow: spawnPoint.row, cityOriginCol: spawnPoint.col, mainCityTileRef: city };
                    }

                    tileObject.ownerId = player.id;
                    grid[r][c] = tileObject;
                    occupiedCoords.add(`${r},${c}`);
                }
            }
        });
    });
    return grid;
}

// --- 動畫管理 ---
const animationManager = (() => {
    const DURATION_PER_TILE = 1000;

    function startUnitMoveAnimation(unit, path) {
        if (unit.isMoving || path.length <= 1) return;
        isActionInProgress = true;
        unit.isMoving = true;
        const animation = { unit, path, startTime: Date.now(), durationPerSegment: DURATION_PER_TILE, totalDuration: (path.length - 1) * DURATION_PER_TILE };
        activeAnimations.push(animation);
    }

    function updateUnitAnimations() {
        const now = Date.now();
        for (let i = activeAnimations.length - 1; i >= 0; i--) {
            const anim = activeAnimations[i];
            const { unit, path, startTime, totalDuration, durationPerSegment } = anim;
            const elapsed = now - startTime;
            if (elapsed >= totalDuration) {
                const finalPos = path[path.length - 1];
                unit.x = finalPos.x;
                unit.y = finalPos.y;
                delete unit.displayX;
                delete unit.displayY;
                unit.isMoving = false;
                activeAnimations.splice(i, 1);
                isActionInProgress = false;
            } else {
                const segmentIndex = Math.floor(elapsed / durationPerSegment);
                const segmentProgress = (elapsed % durationPerSegment) / durationPerSegment;
                const startPos = path[segmentIndex];
                const endPos = path[segmentIndex + 1];
                unit.displayX = startPos.x + (endPos.x - startPos.x) * segmentProgress;
                unit.displayY = startPos.y + (endPos.y - startPos.y) * segmentProgress;
            }
        }
    }
    return { startUnitMoveAnimation, updateUnitAnimations };
})();


// --- 戰鬥系統模組 ---
const combatSystem = (() => {
    let turnCounters = {};
    let nextTurnTime = {};

    function startCombat(context) {
        if (!context.isBattleActive) {
            context.isBattleActive = true;
            turnCounters[context.id] = 0;
            nextTurnTime[context.id] = Date.now();
            activeBattles[context.id] = context;
            showMessage(`${context.name} 的交戰開始！`, 'info');
        }
    }

    function stopCombat(context, result, winnerId = null) {
        if (!context.isBattleActive) return;
        context.isBattleActive = false;
        delete activeBattles[context.id];
        delete nextTurnTime[context.id];

        const player = getCurrentPlayer();
        if (!player) return;

        const isPlayerWinner = winnerId === player.id;

        if (result === 'win') {
            showMessage(`${isPlayerWinner ? '我方' : '敵方'}勝利！`, 'success');

            if (context.type === 'resourceBattle') {
                const tile = context.sourceTile;
                const team = player.cities[0].teams.find(t => t.id === context.attackingTeamId);

                const survivingUnits = context.deployedUnits.filter(u => u.ownerId === winnerId && u.currentHp > 0);

                const objectiveIndex = context.structures.findIndex(s => s.id.startsWith('objective_'));
                if (objectiveIndex !== -1) {
                    const oldObjective = context.structures[objectiveIndex];
                    context.structures[objectiveIndex] = {
                        ...oldObjective,
                        id: 'objective_watchtower', name: '哨塔', type: 'watchtower',
                        ownerId: winnerId, maxHp: 80, currentHp: 80,
                    };
                }

                tile.ownerId = winnerId;
                tile.structure = { type: 'watchtower', name: '哨塔' };
                tile.garrisonedUnits = survivingUnits;
                delete tile.battleId;
                worldMapGrid[tile.row][tile.col] = tile;

                if (currentResourceBattle && currentResourceBattle.id === context.id) {
                    setTimeout(() => {
                        switchToWorldMap();
                    }, 2000);
                }

                if (team && isPlayerWinner) {
                    team.status = 'garrisoned_on_tile';
                    team.location = { type: 'tile', row: tile.row, col: tile.col };

                    const newUnitArray = Array(9).fill(null);
                    survivingUnits.forEach((survivor, index) => {
                        if (index < 9) newUnitArray[index] = survivor;
                    });
                    team.units = newUnitArray;

                    if (team.units.filter(Boolean).length === 0) {
                        const teamIndex = player.cities[0].teams.findIndex(t => t.id === team.id);
                        if (teamIndex > -1) player.cities[0].teams.splice(teamIndex, 1);
                        showMessage(`部隊 ${team.name} 已全滅。`, 'warning');
                    } else {
                        showMessage(`部隊 ${team.name} 已駐守於新地塊 (${tile.row}, ${tile.col})。`, 'success');
                        deployUnitsToWorldTile(team, tile);
                    }
                }

            } else if (currentMapType === 'cityMap') {
                showMessage(`城市 ${context.name} 已被攻陷!`, 'success');
                setTimeout(switchToWorldMap, 2000);
            }
        } else { // 'fail'
            showMessage(`${isPlayerWinner ? '我方' : '敵方'}進攻失敗...`, 'error');
            const tile = context.sourceTile;
            if (tile) delete tile.battleId;

            if (context.attackingTeamId) {
                const teamIndex = player.cities[0].teams.findIndex(t => t.id === context.attackingTeamId);
                if (teamIndex > -1) {
                    player.cities[0].teams.splice(teamIndex, 1);
                    showMessage(`部隊已潰散。`, 'error');
                }
            }
            if(currentMapType === 'cityMap' || (currentResourceBattle && currentResourceBattle.id === context.id)) {
                 setTimeout(switchToWorldMap, 2000);
            }
        }
    }

    function attack(attacker, defender, context) {
        if (!defender) return;
        isActionInProgress = true;
        attacker.isAttacking = true;
        setTimeout(() => {
            let damage = 0;
            if (defender.tag === 'building') { damage = (attacker.type === '器械') ? 3 : 1; }
            else { damage = attacker.ap; }
            defender.currentHp -= damage;
            defender.lastHitBy = attacker;
            if (context === currentCityData || context === currentResourceBattle) { troopListModule.populateTroopList(getCurrentPlayer()); }
            if (defender.currentHp <= 0) {
                defender.currentHp = 0;
                if (defender.tag !== 'building') {
                    const unitList = context.deployedUnits;
                    const defenderIndexOnMap = unitList.findIndex(u => u.id === defender.id);
                    if (defenderIndexOnMap !== -1) { unitList.splice(defenderIndexOnMap, 1); }
                }
            }
            delete attacker.isAttacking;
            isActionInProgress = false;
        }, 1000);
    }

    function processCombat(context) {
        if (!context || !context.isBattleActive || isActionInProgress) return;

        if (Date.now() < nextTurnTime[context.id]) {
            return;
        }

        const defenderId = context.ownerId;
        const allUnitOwnerIds = new Set(context.deployedUnits.map(u => u.ownerId));
        const attackerId = [...allUnitOwnerIds].find(id => id !== defenderId);

        if (!attackerId) {
            stopCombat(context, 'fail', defenderId);
            return;
        }

        const attackingUnits = context.deployedUnits.filter(u => u.ownerId === attackerId);
        if (attackingUnits.length === 0) {
            stopCombat(context, 'fail', defenderId);
            return;
        }

        let mainObjective;
        if (context.type === 'cityMap' || (context.placedBuildings && context.structures.some(s => s.type === 'wall'))) {
            mainObjective = context.structures.find(s => s.type === 'wall');
        } else if (context.type === 'resourceBattle') {
            mainObjective = context.structures.find(s => s.id.startsWith('objective_'));
        }

        if (mainObjective && mainObjective.currentHp <= 0) {
            stopCombat(context, 'win', attackerId);
            return;
        }

        const unitsInTurnOrder = [...context.deployedUnits].sort((a,b) => a.id.localeCompare(b.id));
        if (unitsInTurnOrder.length > 0) {
            const turnIndex = turnCounters[context.id] || 0;
            const currentUnit = unitsInTurnOrder[turnIndex % unitsInTurnOrder.length];

            if (currentUnit) {
                const decision = aiController.processUnitTurn(currentUnit, context);

                if (decision) {
                    if (decision.action === 'attack') {
                        attack(currentUnit, decision.target, context);
                    } else if (decision.action === 'move' && decision.path) {
                        animationManager.startUnitMoveAnimation(currentUnit, decision.path);
                    }
                }
            }
            turnCounters[context.id] = (turnIndex + 1);
            nextTurnTime[context.id] = Date.now() + 500;
        }
    }

    return { startCombat, processCombat };
})();


// --- 全域遊戲循環模組 ---
const gameLoopModule = (() => {
    function init() {
        setInterval(() => {
            const player = getCurrentPlayer();
            if (!player) return;
            animationManager.updateUnitAnimations();
            processWorldMapMarches();

            player.cities.forEach(city => {
                let queueChanged = false;
                for (const buildingName in city.preTrainingQueue) {
                    const queue = city.preTrainingQueue[buildingName];
                    if (queue.length > 0) {
                        const firstUnit = queue[0];
                        if (!firstUnit.startTime) firstUnit.startTime = Date.now();
                        const elapsed = (Date.now() - firstUnit.startTime) / 1000;
                        if (elapsed >= firstUnit.unitData.trainingTime) {
                            const finishedUnit = queue.shift();
                            handleUnitRecruited(finishedUnit, city);
                            if (queue.length > 0) queue[0].startTime = Date.now();
                            queueChanged = true;
                        }
                    }
                }
                if (city === currentCityData && queueChanged) {
                    recruitModule.updateRecruitmentQueueDisplay();
                    troopListModule.populateTroopList(player);
                }
            });

            for (const battleId in activeBattles) {
                combatSystem.processCombat(activeBattles[battleId]);
            }

            mapManager.loadActiveBattles(activeBattles);
            mapManager.draw();
        }, 1000 / 60);
    }
    return { init };
})();

// --- 場景切換 ---
function switchToWorldMap() {
    currentMapType = 'worldMap';
    currentCityData = null;
    currentResourceBattle = null;
    mapManager.loadMapData(worldMapGrid, 'worldMap');
    const player = getCurrentPlayer();
    if(player && player.cities[0]?.worldMapPosition) { mapManager.centerOn(player.cities[0].worldMapPosition.row, player.cities[0].worldMapPosition.col); }
    updateUIVisibility();
    mapManager.hideTileInteractionOverlay();
}
function switchToCityMap(cityData) {
    currentMapType = 'cityMap';
    currentCityData = cityData;
    currentResourceBattle = null;
    mapManager.loadMapData(cityData, 'cityMap');
    mapManager.centerOn(8, 8);
    updateUIVisibility();
    mapManager.hideTileInteractionOverlay();
}

function switchToResourceBattleMap(targetTile) {
    const battleId = `battle_${targetTile.row}_${targetTile.col}`;

    if (activeBattles[battleId]) {
        currentResourceBattle = activeBattles[battleId];
        currentMapType = 'resourceBattleMap';
        currentCityData = null;

        showMessage(`正在觀看 (${targetTile.row}, ${targetTile.col}) 的戰鬥`, 'info');
        mapManager.loadMapData(currentResourceBattle, 'resourceBattleMap');
        mapManager.centerOn(5.5, 5.5);
        updateUIVisibility();
        mapManager.hideTileInteractionOverlay();
    } else {
        currentMapType = 'resourceBattleMap';
        currentCityData = null;

        let objectiveStructure;
        const commonProps = { tag: 'building', x: 5, y: 5, targetPoint: { x: 5, y: 5 } };

        if (targetTile.ownerId && targetTile.structure?.type === 'watchtower') {
            objectiveStructure = { ...commonProps, id: 'objective_watchtower', name: '哨塔', type: 'watchtower', ownerId: targetTile.ownerId, maxHp: 80, currentHp: 80 };
        } else {
            objectiveStructure = { ...commonProps, id: 'objective_flag', name: '旗幟', type: 'flag', ownerId: null, maxHp: 3, currentHp: 3 };
        }

        const viewContext = {
            id: `view_${targetTile.row}_${targetTile.col}`,
            name: `資源地 (${targetTile.row}, ${targetTile.col})`,
            type: 'resourceBattle',
            ownerId: targetTile.ownerId,
            gridSizeX: 11,
            gridSizeY: 11,
            sourceTile: targetTile,
            isBattleActive: false,
            deployedUnits: targetTile.garrisonedUnits ? JSON.parse(JSON.stringify(targetTile.garrisonedUnits)) : [],
            structures: [objectiveStructure],
        };
        currentResourceBattle = viewContext;

        showMessage(`正在偵查資源地 (${targetTile.row}, ${targetTile.col})`, 'info');
        mapManager.loadMapData(currentResourceBattle, 'resourceBattleMap');
        mapManager.centerOn(5.5, 5.5);
        updateUIVisibility();
        mapManager.hideTileInteractionOverlay();
    }
}


// --- UI 更新與相關邏輯 ---
function updateUIVisibility() {
    const isWorldMap = currentMapType === 'worldMap';
    const isCityMap = currentMapType === 'cityMap';
    dom.troopsButton.style.display = 'flex';
    dom.buildButton.style.display = isCityMap ? 'flex' : 'none';
    dom.callEnemyButton.style.display = isCityMap ? 'flex' : 'none';
    if (dom.backButton) {
        if (isCityMap || currentMapType === 'resourceBattleMap') {
            dom.backButton.style.display = 'flex';
            dom.backButton.textContent = '返回世界';
            dom.backButton.onclick = switchToWorldMap;
        } else {
            dom.backButton.style.display = 'none';
        }
    }
    checkAndShowGoBackButton();
    if(dom.minimapButton) { dom.minimapButton.style.display = isWorldMap ? 'flex' : 'none'; }
}
function checkAndShowGoBackButton() { if (currentMapType !== 'worldMap' || playerCityCoordinates.length === 0) { dom.goBackToCityButton.style.display = 'none'; return; } const cameraCenter = mapManager.getCameraCenter(); const distanceThreshold = 8; const isFarFromAllCities = playerCityCoordinates.every(cityPos => { const distance = Math.hypot(cameraCenter.row - cityPos.row, cameraCenter.col - cityPos.col); return distance > distanceThreshold; }); dom.goBackToCityButton.style.display = isFarFromAllCities ? 'flex' : 'none'; }
function cycleToGoBackToCity() { if (playerCityCoordinates.length === 0) return; goBackCityIndex = (goBackCityIndex + 1) % playerCityCoordinates.length; const targetCity = playerCityCoordinates[goBackCityIndex]; mapManager.centerOn(targetCity.row, targetCity.col); }

// --- 事件處理與邏輯委派 ---
function handleTileClick(payload) {
    if (buildingsModule.isPlacing()) { buildingsModule.confirmPlacement(); return; }
    if (currentMapType === 'worldMap') {

        if (!worldMapGrid[payload.row] || !worldMapGrid[payload.row][payload.col]) {
            console.warn(`Clicked on an invalid world map coordinate: (${payload.row}, ${payload.col})`);
            return;
        }

        const clickedTile = worldMapGrid[payload.row][payload.col];
        if (!clickedTile) return;
        let targetDataForPopup = clickedTile.isOccupiedByCity ? (clickedTile.mainCityTileRef || clickedTile) : clickedTile;

        mapManager.showTileInteractionOverlay(targetDataForPopup, payload);

        const setupDispatchAction = (buttonElement, command, text) => {
            buttonElement.classList.remove('hidden');
            buttonElement.textContent = text;
            buttonElement.onclick = () => {
                showDispatchModal(targetDataForPopup, command, payload);
                mapManager.hideTileInteractionOverlay();
            };
        };

        if (targetDataForPopup?.isMultiTileCity) {
            if (targetDataForPopup.ownerId === currentUser?.uid) {
                dom.tileActionEnter.classList.remove('hidden');
                dom.tileActionEnter.textContent = '進入城市';
                dom.tileActionEnter.onclick = () => { switchToCityMap(targetDataForPopup); mapManager.hideTileInteractionOverlay(); };
                setupDispatchAction(dom.tileActionMarch, 'return_to_city', '部隊回城');
            } else {
                setupDispatchAction(dom.tileActionOccupy, 'occupy_city', '攻城');
            }
        } else if (targetDataForPopup?.type?.startsWith('resource-')) {
            const isOwnedByPlayer = targetDataForPopup.ownerId === currentUser.uid;
            const isBattleActive = !!targetDataForPopup.battleId && activeBattles[targetDataForPopup.battleId];

            dom.tileActionEnter.classList.remove('hidden');
            dom.tileActionEnter.textContent = isBattleActive ? '觀戰' : '偵查';
            dom.tileActionEnter.onclick = () => {
                const tileDataForBattle = { ...targetDataForPopup, row: payload.row, col: payload.col };
                switchToResourceBattleMap(tileDataForBattle);
                mapManager.hideTileInteractionOverlay();
            };

            if (isOwnedByPlayer && !isBattleActive) {
                setupDispatchAction(dom.tileActionMarch, 'march', '行進');
                const buildableOrigin = findBuildable2x2Origin(payload.row, payload.col);
                if (buildableOrigin) {
                    dom.tileActionBuild.classList.remove('hidden');
                    dom.tileActionBuild.onclick = () => handleBuildCityRequest(buildableOrigin.row, buildableOrigin.col);
                }
            } else if (!isOwnedByPlayer) {
                 setupDispatchAction(dom.tileActionOccupy, 'occupy_resource', '攻佔');
            }
        }
    } else if (currentMapType === 'cityMap' && currentCityData) {
        const clickedBuilding = currentCityData.placedBuildings.find(b => b.row === payload.row && b.col === payload.col);
        if (clickedBuilding) {
            if (payload.isLongPress) buildingsModule.startPlacement(clickedBuilding, true, clickedBuilding);
            else buildingsModule.handleBuildingClick(clickedBuilding);
        }
    }
}

function handlePlacementAction(action) { if (action === 'confirm') buildingsModule.confirmPlacement(); else if (action === 'cancel') buildingsModule.cancelPlacement(); }
function handleBuildingPlaced(newBuilding, oldBuilding) { const city = currentCityData; if (!city) return; if (oldBuilding) { const index = city.placedBuildings.findIndex(b => b.name === oldBuilding.name && b.row === oldBuilding.row && b.col === oldBuilding.col); if (index > -1) city.placedBuildings.splice(index, 1); } city.placedBuildings.push(newBuilding); mapManager.draw(); }

function deployUnitToCityMap(unit, cityContext) {
    const allSpots = battleMapLogic.findAllPlacementSpots(8, 4, cityContext);
    const occupiedSpots = new Set(cityContext.deployedUnits.map(u => `${u.x},${u.y}`));
    const availableSpot = allSpots.find(spot => !occupiedSpots.has(`${spot.x},${spot.y}`));

    if (availableSpot) {
        unit.x = availableSpot.x;
        unit.y = availableSpot.y;
        cityContext.deployedUnits.push(unit);
        showMessage(`${unit.name} 已部署至城市地圖 (${unit.x}, ${unit.y})！`, 'success');
    } else {
        unit.x = -1;
        unit.y = -1;
        showMessage(`戰場已滿，${unit.name} 已進入後備部隊。`, "info");
    }
}


function handleUnitRecruited(recruitmentInfo, cityContext) {
    const { unitData, teamIndex, slotIndex, id } = recruitmentInfo;
    if (!cityContext || !cityContext.teams[teamIndex]) { console.error("無法找到對應的隊伍:", recruitmentInfo); return; }

    const newUnit = {
        ...unitData, id: id, ownerId: currentUser.uid, currentHp: unitData.maxHp,
        teamIndex: teamIndex
    };
    cityContext.teams[teamIndex].units[slotIndex] = newUnit;

    deployUnitToCityMap(newUnit, cityContext);

    if (cityContext === currentCityData) {
        troopListModule.populateTroopList(getCurrentPlayer());
        mapManager.draw();
    }
}

// --- 世界地圖尋路函式 ---
function findWorldMapPath(start, end, grid) {
    const gridSize = grid.length;
    const queue = [ [start] ];
    const visited = new Set([`${start.row},${start.col}`]);

    while (queue.length > 0) {
        const path = queue.shift();
        const pos = path[path.length - 1];

        if (pos.row === end.row && pos.col === end.col) {
            return path;
        }

        const neighbors = [
            { row: pos.row - 1, col: pos.col },
            { row: pos.row + 1, col: pos.col },
            { row: pos.row, col: pos.col - 1 },
            { row: pos.row, col: pos.col + 1 }
        ];

        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;
            if (neighbor.row >= 0 && neighbor.row < gridSize &&
                neighbor.col >= 0 && neighbor.col < gridSize &&
                !visited.has(key)) {

                visited.add(key);
                const newPath = [...path, neighbor];
                queue.push(newPath);
            }
        }
    }
    return null;
}

function initiateBattle(targetTile, attackingTeam) {
    const battleId = `battle_${targetTile.row}_${targetTile.col}`;
    if (activeBattles[battleId]) {
        console.log(`戰鬥 (${targetTile.row}, ${targetTile.col}) 已在進行中。`);
        return;
    }

    let objectiveStructure;
    const commonProps = { tag: 'building', x: 5, y: 5, targetPoint: { x: 5, y: 5 } };

    if (targetTile.ownerId) {
        objectiveStructure = { ...commonProps, id: 'objective_watchtower', name: '哨塔', type: 'watchtower', ownerId: targetTile.ownerId, maxHp: 80, currentHp: 80 };
    } else {
        objectiveStructure = { ...commonProps, id: 'objective_flag', name: '旗幟', type: 'flag', ownerId: null, maxHp: 3, currentHp: 3 };
    }

    const newBattle = {
        id: battleId,
        name: `資源地 (${targetTile.row}, ${targetTile.col})`,
        type: 'resourceBattle',
        ownerId: targetTile.ownerId,
        gridSizeX: 11,
        gridSizeY: 11,
        sourceTile: targetTile,
        isBattleActive: false,
        deployedUnits: [],
        structures: [objectiveStructure],
        attackingTeamId: attackingTeam.id
    };

    if (attackingTeam && attackingTeam.units) {
        attackingTeam.units.forEach((unit, index) => {
            if (unit) {
                const newUnitInstance = JSON.parse(JSON.stringify(unit));
                newUnitInstance.x = 1 + (index % 3);
                newUnitInstance.y = 4 + Math.floor(index / 3);
                newUnitInstance.teamId = attackingTeam.id;
                newBattle.deployedUnits.push(newUnitInstance);
            }
        });
    }

    if (targetTile.garrisonedUnits) {
        const defendingUnits = JSON.parse(JSON.stringify(targetTile.garrisonedUnits));
        defendingUnits.forEach((unit, index) => {
            unit.x = 9 - (index % 3);
            unit.y = 4 + Math.floor(index / 3);
            newBattle.deployedUnits.push(unit);
        });
    }

    combatSystem.startCombat(newBattle);
    targetTile.battleId = battleId;
    showMessage(`部隊 ${attackingTeam.name} 已在 (${targetTile.row}, ${targetTile.col}) 與敵人交戰！`, 'warning');
}


// --- 行軍與築城邏輯核心 ---

function showDispatchModal(targetTile, command, targetCoords) {
    const player = getCurrentPlayer();
    if (!player || !player.cities[0]) return;
    const city = player.cities[0];
    const allTeams = city.teams;

    dom.dispatchModalTitle.textContent = {
        'occupy_resource': `攻佔資源點: (${targetCoords.row}, ${targetCoords.col})`,
        'occupy_city': `攻擊城市: ${targetTile.ownerName}`,
        'march': `行進至: (${targetCoords.row}, ${targetCoords.col})`,
        'return_to_city': '選擇部隊返回主城'
    }[command];

    dom.dispatchTeamList.innerHTML = '';
    if (allTeams.length === 0) {
        dom.dispatchTeamList.innerHTML = `<p class="text-center text-gray-400">無任何部隊。</p>`;
    }

    const recruitingTeamIndexes = new Set(
        Object.values(city.preTrainingQueue).flat().map(item => item.teamIndex)
    );

    allTeams.forEach((team, teamIndex) => {
        let isAvailable = true;
        let reason = '';

        if (recruitingTeamIndexes.has(teamIndex)) {
            isAvailable = false;
            reason = '招募中';
        } else if (team.status === 'marching' || team.status === 'returning') {
            isAvailable = false;
            reason = `行軍中 (前往 ${team.marchTarget.name})`;
        } else if (team.status === 'in_battle') {
            isAvailable = false;
            reason = `交戰中`;
        } else if (command === 'return_to_city') {
            if (team.status !== 'garrisoned_on_tile') {
                isAvailable = false;
                reason = '已在主城';
            }
        } else {
            if (team.status === 'garrisoned_on_tile' && team.location.row === targetCoords.row && team.location.col === targetCoords.col) {
                isAvailable = false;
                reason = '已在此地';
            }
        }

        const teamEl = document.createElement('div');
        teamEl.className = `bg-gray-700 p-3 rounded-lg flex items-center justify-between transition-colors ${!isAvailable ? 'opacity-50' : 'hover:bg-gray-600'}`;

        const totalHp = team.units.reduce((sum, u) => sum + (u ? u.currentHp : 0), 0);
        const maxHp = team.units.reduce((sum, u) => sum + (u ? u.maxHp : 0), 0);
        const hpPercentage = maxHp > 0 ? (totalHp / maxHp * 100).toFixed(0) : 0;

        teamEl.innerHTML = `
            <div class="flex-grow mr-4">
                <p class="font-bold text-white">${team.name}</p>
                <div class="w-full bg-gray-900 rounded-full h-2.5 mt-2">
                    <div class="bg-green-500 h-2.5 rounded-full" style="width: ${hpPercentage}%" title="HP: ${hpPercentage}%"></div>
                </div>
                ${reason ? `<p class="text-xs text-yellow-400 font-bold mt-1">狀態: ${reason}</p>` : ''}
            </div>
            <button class="dispatch-btn bg-cyan-600 text-white font-bold py-2 px-4 rounded flex-shrink-0" ${!isAvailable ? 'disabled' : ''}>派遣</button>
        `;

        if (isAvailable) {
            teamEl.querySelector('.dispatch-btn').onclick = () => {
                startMarch(team.id, targetTile, command, targetCoords);
                hideDispatchModal();
            };
        }
        dom.dispatchTeamList.appendChild(teamEl);
    });

    dom.dispatchModalOverlay.classList.remove('hidden');
}

function hideDispatchModal() {
    dom.dispatchModalOverlay.classList.add('hidden');
}

function deployUnitsToWorldTile(team, tile) {
    const unitPositions = [
        { dx: -0.25, dy: -0.25 }, { dx: 0.25, dy: -0.25 }, { dx: 0, dy: 0 },
        { dx: -0.25, dy: 0.25 }, { dx: 0.25, dy: 0.25 }
    ];
    team.units.forEach((unit, index) => {
        if (unit && index < unitPositions.length) {
            unit.worldMapX = tile.col + 0.5 + unitPositions[index].dx;
            unit.worldMapY = tile.row + 0.5 + unitPositions[index].dy;
        }
    });
}

function startMarch(teamId, targetTile, command, targetCoords) {
    const player = getCurrentPlayer();
    const city = player.cities.find(c => c.teams.some(t => t.id === teamId));
    if (!city) { showMessage("找不到部隊所屬的城市。", "error"); return; }

    const team = city.teams.find(t => t.id === teamId);
    if (!team) { showMessage("找不到要派遣的部隊。", "error"); return; }

    let startPoint;
    let endPoint = targetCoords;

    // *** BUG FIX START ***
    // 當部隊從一個地塊出發時，必須清除該地塊的駐軍資料
    if (team.status === 'garrisoned_on_tile') {
        const startTile = worldMapGrid[team.location.row][team.location.col];
        if (startTile) {
            delete startTile.garrisonedUnits;
            console.log(`已清除地塊 (${team.location.row}, ${team.location.col}) 的駐軍殘影。`);
        }
    }
    // *** BUG FIX END ***

    if (team.status === 'garrisoned_in_city') {
        const cityTiles = [
            { row: city.worldMapPosition.row, col: city.worldMapPosition.col },
            { row: city.worldMapPosition.row + 1, col: city.worldMapPosition.col },
            { row: city.worldMapPosition.row, col: city.worldMapPosition.col + 1 },
            { row: city.worldMapPosition.row + 1, col: city.worldMapPosition.col + 1 },
        ];
        let minDistance = Infinity;
        cityTiles.forEach(tile => {
            const distance = Math.hypot(targetCoords.col - tile.col, targetCoords.row - tile.row);
            if (distance < minDistance) {
                minDistance = distance;
                startPoint = tile;
            }
        });
        const unitIdsToMove = new Set(team.units.filter(Boolean).map(u => u.id));
        city.deployedUnits = city.deployedUnits.filter(u => !unitIdsToMove.has(u.id));
    } else {
        startPoint = team.location;
        team.units.forEach(u => { if(u) { delete u.worldMapX; delete u.worldMapY; } });
    }

    if (command === 'return_to_city') {
        const cityTiles = [
            { row: targetTile.mainCityOriginRow, col: targetTile.mainCityOriginCol },
            { row: targetTile.mainCityOriginRow + 1, col: targetTile.mainCityOriginCol },
            { row: targetTile.mainCityOriginRow, col: targetTile.mainCityOriginCol + 1 },
            { row: targetTile.mainCityOriginRow + 1, col: targetTile.mainCityOriginCol + 1 },
        ];
        let minDistance = Infinity;
        cityTiles.forEach(tile => {
            const distance = Math.hypot(startPoint.col - tile.col, startPoint.row - tile.row);
            if (distance < minDistance) {
                minDistance = distance;
                endPoint = tile;
            }
        });
    }

    const path = findWorldMapPath(startPoint, endPoint, worldMapGrid);

    if (!path || path.length === 0) {
        showMessage("找不到可行的行軍路徑！", "error");
        return;
    }

    const unitsWithSpeed = team.units.filter(u => u && u.movementSpeed > 0);
    if (unitsWithSpeed.length === 0) return showMessage("隊伍中沒有可移動的單位！", "error");

    const totalSpeed = unitsWithSpeed.reduce((sum, u) => sum + u.movementSpeed, 0);
    const teamSpeed = totalSpeed / unitsWithSpeed.length;
    const TIME_FACTOR_PER_TILE = 1500;
    const totalDurationMs = (path.length - 1) * (TIME_FACTOR_PER_TILE / teamSpeed) * 1000;

    team.status = 'marching';
    team.marchTarget = { name: targetTile.name || `地塊(${targetCoords.row}, ${targetCoords.col})`, row: endPoint.row, col: endPoint.col };

    const march = {
        id: `march_${crypto.randomUUID()}`, teamId: team.id, startTime: Date.now(),
        totalDuration: totalDurationMs, path: path,
        targetTile: { ...targetTile, row: endPoint.row, col: endPoint.col }, command: command
    };
    worldMapMarches.push(march);

    showMessage(`部隊 ${team.name} 已出發，預計 ${Math.round(totalDurationMs / 1000)} 秒後抵達！`, "success");
    mapManager.draw();
}

function handleMarchArrival(march) {
    const player = getCurrentPlayer();
    const team = player.cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) { return; }

    const arrivalCoords = march.path[march.path.length - 1];
    showMessage(`部隊 ${team.name} 已抵達 (${arrivalCoords.row}, ${arrivalCoords.col})！`);
    team.marchTarget = null;

    const arrivalCity = player.cities.find(c =>
        arrivalCoords.row >= c.worldMapPosition.row && arrivalCoords.row < c.worldMapPosition.row + 2 &&
        arrivalCoords.col >= c.worldMapPosition.col && arrivalCoords.col < c.worldMapPosition.col + 2
    );

    switch (march.command) {
        case 'march':
            team.status = 'garrisoned_on_tile';
            team.location = { type: 'tile', row: arrivalCoords.row, col: arrivalCoords.col };
            deployUnitsToWorldTile(team, march.targetTile);
            break;

        case 'return_to_city':
        case 'returning':
            if (arrivalCity) {
                team.status = 'garrisoned_in_city';
                team.location = { type: 'city', id: arrivalCity.id };
                team.units.filter(Boolean).forEach(unit => deployUnitToCityMap(unit, arrivalCity));
            } else {
                team.status = 'garrisoned_on_tile';
                team.location = { type: 'tile', row: arrivalCoords.row, col: arrivalCoords.col };
                deployUnitsToWorldTile(team, { row: arrivalCoords.row, col: arrivalCoords.col });
            }
            break;

        case 'occupy_resource':
        case 'occupy_city':
            team.status = 'in_battle';
            team.location = { type: 'tile', row: arrivalCoords.row, col: arrivalCoords.col };
            initiateBattle(march.targetTile, team);
            break;
    }

    if (document.getElementById('troop-list-modal-overlay')?.classList.contains('hidden') === false) {
        troopListModule.show({ type: 'world', player });
    }
}

function processWorldMapMarches() {
    const now = Date.now();
    for (let i = worldMapMarches.length - 1; i >= 0; i--) {
        const march = worldMapMarches[i];
        if (now - march.startTime >= march.totalDuration) {
            worldMapMarches.splice(i, 1);
            handleMarchArrival(march);
        }
    }
}

function findBuildable2x2Origin(row, col) {
    const origins = [
        { r: row, c: col },
        { r: row - 1, c: col },
        { r: row, c: col - 1 },
        { r: row - 1, c: col - 1}
    ];

    for (const origin of origins) {
        if (origin.r < 0 || origin.c < 0) continue;
        if (canBuildCityAt(origin.r, origin.c)) {
            return origin;
        }
    }
    return null;
}

function canBuildCityAt(startRow, startCol) {
    const player = getCurrentPlayer();
    if (!player) return false;

    for (let r = startRow; r < startRow + 2; r++) {
        for (let c = startCol; c < startCol + 2; c++) {
            if (r >= 60 || c >= 60 || !worldMapGrid[r][c] || worldMapGrid[r][c].ownerId !== player.id || worldMapGrid[r][c].isMultiTileCity) {
                return false;
            }
        }
    }
    return true;
}

function handleBuildCityRequest(row, col) {
    showMessage("正在修建分城...", "info");
    const player = getCurrentPlayer();
    const newCity = createNewCityInstance(CITY_TEMPLATE, player.id, `分城 ${player.cities.length}`);
    newCity.worldMapPosition = { row, col };

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const r = row + i;
            const c = col + j;

            const originalTile = worldMapGrid[r][c];
            if (!originalTile) {
                console.error(`築城時發現無效地塊: (${r}, ${c})`);
                continue;
            }

            if (i === 0 && j === 0) {
                worldMapGrid[r][c] = {
                    ...originalTile,
                    ...newCity,
                    type: 'city-own',
                    ownerName: player.name,
                    isMultiTileCity: true,
                    mainCityOriginRow: row,
                    mainCityOriginCol: col
                };
            } else {
                Object.assign(originalTile, {
                    isOccupiedByCity: true,
                    cityOriginRow: row,
                    cityOriginCol: col,
                    mainCityTileRef: worldMapGrid[row][col],
                    ownerId: player.id
                });
            }
        }
    }

    player.cities.push(newCity);
    playerCityCoordinates.push({ row, col });
    showMessage("分城修建完成！", "success");
    mapManager.draw();
}

function handleMarchInteraction(marchOrTeam) {
    let march;
    if (marchOrTeam.path) {
        march = marchOrTeam;
    } else {
        march = worldMapMarches.find(m => m.teamId === marchOrTeam.id);
    }

    if (!march) {
        console.error("無法找到對應的行軍任務", marchOrTeam);
        return;
    }

    currentSelectedMarch = march;
    const team = getCurrentPlayer().cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (dom.marchInteractionTitle) {
        dom.marchInteractionTitle.textContent = `${team.name} - 行軍指令`;
    }
    dom.marchInteractionModalOverlay.classList.remove('hidden');
}

function handleStopMarch() {
    if (!currentSelectedMarch) return;

    const marchIndex = worldMapMarches.findIndex(m => m.id === currentSelectedMarch.id);
    if (marchIndex === -1) return;

    const march = worldMapMarches[marchIndex];
    const team = getCurrentPlayer().cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) return;

    const pathLength = march.path.length - 1;
    const durationPerSegment = march.totalDuration / pathLength;
    const elapsed = Date.now() - march.startTime;
    const segmentIndex = Math.floor(elapsed / durationPerSegment);
    const currentPos = march.path[Math.min(segmentIndex, pathLength)];

    worldMapMarches.splice(marchIndex, 1);

    team.status = 'garrisoned_on_tile';
    team.location = { type: 'tile', row: currentPos.row, col: currentPos.col };
    team.marchTarget = null;
    deployUnitsToWorldTile(team, { row: currentPos.row, col: currentPos.col });

    showMessage(`${team.name} 已停止行軍並駐紮於 (${currentPos.row}, ${currentPos.col})。`, 'success');

    dom.marchInteractionModalOverlay.classList.add('hidden');
    currentSelectedMarch = null;
    mapManager.draw();
    troopListModule.populateTroopList({ type: 'world', player: getCurrentPlayer() });
}

function handleReturnMarch() {
    if (!currentSelectedMarch) return;

    const marchIndex = worldMapMarches.findIndex(m => m.id === currentSelectedMarch.id);
    if (marchIndex === -1) return;

    const march = worldMapMarches[marchIndex];
    const team = getCurrentPlayer().cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) return;

    team.status = 'returning';
    team.marchTarget = { name: '返回中...' };

    worldMapMarches.splice(marchIndex, 1);

    const pathLength = march.path.length - 1;
    const durationPerSegment = march.totalDuration / pathLength;
    const elapsed = Date.now() - march.startTime;
    const segmentIndex = Math.floor(elapsed / durationPerSegment);

    const returnPath = march.path.slice(0, segmentIndex + 1).reverse();

    if (returnPath.length < 2) {
        handleMarchArrival({ ...march, path: [march.path[0], march.path[0]], command: 'returning' });
    } else {
        const unitsWithSpeed = team.units.filter(u => u && u.movementSpeed > 0);
        const totalSpeed = unitsWithSpeed.reduce((sum, u) => sum + u.movementSpeed, 0);
        const teamSpeed = totalSpeed / unitsWithSpeed.length;
        const TIME_FACTOR_PER_TILE = 1500;
        const newDuration = (returnPath.length - 1) * (TIME_FACTOR_PER_TILE / teamSpeed) * 1000;

        const returnMarch = {
            id: `march_${crypto.randomUUID()}`,
            teamId: team.id,
            startTime: Date.now(),
            totalDuration: newDuration,
            path: returnPath,
            targetTile: march.path[0],
            command: 'returning'
        };

        worldMapMarches.push(returnMarch);
        showMessage(`${team.name} 已取消行軍，正在返回起點。`, 'info');
    }

    dom.marchInteractionModalOverlay.classList.add('hidden');
    currentSelectedMarch = null;
    mapManager.draw();
    troopListModule.populateTroopList({ type: 'world', player: getCurrentPlayer() });
}


// --- 遊戲啟動與重置流程 ---
function getDomElements() {
    const ids = [
        'game-map-canvas', 'build-button', 'info-button', 'troops-button', 'call-enemy-button', 'back-button',
        'info-modal-overlay', 'info-modal-close-button', 'info-to-illustrated-guide-button', 'go-back-to-city-button',
        'tile-action-enter', 'tile-action-occupy', 'tile-action-march', 'tile-action-build', 'minimap-button',
        'dispatch-modal-overlay', 'dispatch-modal-close', 'dispatch-team-list', 'dispatch-modal-title',
        'march-interaction-modal-overlay', 'march-interaction-close', 'march-interaction-title', 'march-action-stop', 'march-action-return'
    ];
    ids.forEach(id => { const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase()); dom[camelCaseId] = document.getElementById(id); });
}

function setupGlobalEventListeners() {
    if (dom.buildButton) dom.buildButton.addEventListener('click', () => { if (currentUser && currentMapType === 'cityMap') buildingsModule.showBuildModal(); });

    if (dom.troopsButton) {
        dom.troopsButton.addEventListener('click', () => {
            const player = getCurrentPlayer();
            if (!player) return;

            let context;
            switch(currentMapType) {
                case 'worldMap':
                    context = { type: 'world', player: player };
                    break;
                case 'cityMap':
                    context = { type: 'city', cityData: currentCityData, player: player };
                    break;
                case 'resourceBattleMap':
                    context = { type: 'battle', battleData: currentResourceBattle, player: player };
                    break;
                default:
                    context = { type: 'world', player: player };
            }
            troopListModule.show(context);
        });
    }

    if (dom.infoButton) dom.infoButton.addEventListener('click', () => document.getElementById('info-modal-overlay').classList.remove('hidden'));
    if (dom.infoModalCloseButton) dom.infoModalCloseButton.addEventListener('click', () => document.getElementById('info-modal-overlay').classList.add('hidden'));
    if (dom.infoToIllustratedGuideButton) dom.infoToIllustratedGuideButton.addEventListener('click', () => { document.getElementById('info-modal-overlay').classList.add('hidden'); illustratedGuideModule.show(); });
    if (dom.backButton) dom.backButton.addEventListener('click', switchToWorldMap);
    if (dom.goBackToCityButton) dom.goBackToCityButton.addEventListener('click', cycleToGoBackToCity);

    if (dom.dispatchModalOverlay) dom.dispatchModalOverlay.addEventListener('click', e => { if (e.target === dom.dispatchModalOverlay) hideDispatchModal(); });
    if (dom.dispatchModalClose) dom.dispatchModalClose.addEventListener('click', hideDispatchModal);

    if (dom.marchInteractionModalOverlay) dom.marchInteractionModalOverlay.addEventListener('click', e => { if (e.target === dom.marchInteractionModalOverlay) dom.marchInteractionModalOverlay.classList.add('hidden'); });
    if (dom.marchInteractionClose) dom.marchInteractionClose.addEventListener('click', () => dom.marchInteractionModalOverlay.classList.add('hidden'));
    if (dom.marchActionStop) dom.marchActionStop.addEventListener('click', handleStopMarch);
    if (dom.marchActionReturn) dom.marchActionReturn.addEventListener('click', handleReturnMarch);
}

function initStaticWorld() {
    getDomElements();
    setupGlobalEventListeners();
    mapManager.init(dom.gameMapCanvas, {
        onTileClick: handleTileClick,
        onMarchClick: handleMarchInteraction,
        onPlacementAction: handlePlacementAction,
        showMessage: showMessage,
        getCurrentUser: () => currentUser,
        onCameraMove: checkAndShowGoBackButton
    });
    recruitModule.init({ showMessage, getCurrentCity: () => currentCityData, getCurrentPlayer: getCurrentPlayer });
    troopListModule.init({
        showMessage,
        onMarchClick: handleMarchInteraction
    });
    illustratedGuideModule.init({ recruitModule });
    buildingsModule.init({ mapManager, showMessage, getCurrentCity: () => currentCityData, onBuildingPlaced: handleBuildingPlaced });
    gameLoopModule.init();
}

async function initPlayerSession(firestore, user, mockPlayerData) {
    db = firestore;
    currentUser = user;
    const initialCity = createNewCityInstance(CITY_TEMPLATE, user.uid, '主城');

    const sampleTeam = {
        id: `team_${crypto.randomUUID()}`,
        name: `先鋒軍`,
        units: Array(9).fill(null),
        status: 'garrisoned_in_city',
        location: { type: 'city' }
    };
    const soldierData = getSoldiersForBuilding("兵營")[0];
    if (soldierData) {
        const newUnit = { ...soldierData, id: crypto.randomUUID(), ownerId: user.uid, currentHp: soldierData.maxHp };
        sampleTeam.units[0] = newUnit;
        deployUnitToCityMap(newUnit, initialCity);
    }
    initialCity.teams.push(sampleTeam);

    playersData = [{ id: user.uid, name: mockPlayerData.name || `玩家_${user.uid.substring(0,4)}`, cities: [initialCity], gameSeed: mockPlayerData.gameSeed || Date.now().toString() }];
    const currentPlayerObject = getCurrentPlayer();
    worldMapGrid = generateWorldMapData(playersData, currentPlayerObject.gameSeed, currentUser.uid);
    if (currentPlayerObject && currentPlayerObject.cities) { playerCityCoordinates = currentPlayerObject.cities.map(city => city.worldMapPosition).filter(pos => pos); }
    mapManager.loadPlayersData(playersData);
    mapManager.loadWorldMapMarches(worldMapMarches);
    switchToWorldMap();
}

function resetGameSession() { currentUser = null; db = null; playersData = []; worldMapGrid = []; worldMapMarches = []; playerCityCoordinates = []; mapManager.loadPlayersData([]); mapManager.loadMapData(Array(60).fill(0).map(() => Array(60).fill({ type: 'empty' })), 'worldMap'); }

function runMockSession() {
    console.warn("=== 警告：正在以模擬模式 (MOCK_MODE) 運行 ===");
    const mockUser = { uid: 'player_A', isAnonymous: true };
    const mockPlayerData = { name: `模擬玩家` };
    document.getElementById('auth-container')?.classList.add('hidden');
    initPlayerSession(null, mockUser, mockPlayerData);
    dom.callEnemyButton.addEventListener('click', () => {
        if (currentMapType !== 'cityMap') {
            showMessage("請先進入城市以呼叫敵人。", "info");
            return;
        }
        const city = currentCityData;
        if (city.isBattleActive) return;
        const spawnPoint = { x: 8, y: 0 };
        const enemyData = getSoldiersForBuilding("兵營")[0];
        for (let i = 0; i < 3; i++) {
            const newEnemy = { ...enemyData, id: crypto.randomUUID(), ownerId: 'enemy_B', currentHp: enemyData.maxHp, x: spawnPoint.x, y: spawnPoint.y + i };
            city.deployedUnits.push(newEnemy);
        }
        showMessage(`敵軍來襲！`, 'warning');
        combatSystem.startCombat(city);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initStaticWorld();
    if (MOCK_MODE) {
        runMockSession();
    } else {
        // setupFirebaseAuth({ onLogin: initPlayerSession, onLogout: resetGameSession });
    }
});
