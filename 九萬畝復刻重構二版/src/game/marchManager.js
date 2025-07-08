// src/game/marchManager.js
// 職責：管理所有世界地圖上的行軍活動，包括路徑計算、計時、抵達處理及互動。
// [行軍修復] 移除了 startMarch 中錯誤的 city.deployedUnits 操作，將世界行軍與城市地圖部署解耦。

import { battleMapLogic } from './battleMapLogic.js';

let worldMapMarchesRef;
let worldMapGridRef;
let getCurrentPlayerRef;
let showMessageCallback;
let onMarchEndCallback;
let onTeamUpdateCallback;

function findWorldMapPath(start, end, grid, playerId) {
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
            
            if (neighbor.row < 0 || neighbor.row >= gridSize ||
                neighbor.col < 0 || neighbor.col >= gridSize ||
                visited.has(key)) {
                continue;
            }

            const tile = grid[neighbor.row][neighbor.col];
            const isObstacle = tile && (tile.isMultiTileCity || tile.isOccupiedByCity) && tile.ownerId !== playerId;
            
            if (isObstacle) {
                continue;
            }

            visited.add(key);
            const newPath = [...path, neighbor];
            queue.push(newPath);
        }
    }
    return null;
}


function startMarch(teamId, targetTile, command, targetCoords) {
    const player = getCurrentPlayerRef();
    const city = player.cities.find(c => c.teams.some(t => t.id === teamId));
    if (!city) { showMessageCallback("找不到部隊所屬的城市。", "error"); return; }

    const team = city.teams.find(t => t.id === teamId);
    if (!team) { showMessageCallback("找不到要派遣的部隊。", "error"); return; }

    let startPoint;
    let endPoint = targetCoords;

    if (team.status === 'garrisoned_on_tile') {
        const startTile = worldMapGridRef[team.location.row][team.location.col];
        if (startTile) {
            delete startTile.garrisonedUnits;
        }
        startPoint = team.location;
        team.units.forEach(u => { if(u) { delete u.worldMapX; delete u.worldMapY; } });
    } else { // 'garrisoned_in_city'
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
        // [核心修正] 移除此處對 city.deployedUnits 的操作。
        // 世界地圖的行軍不應該直接影響城市地圖的單位部署狀態。
        // const unitIdsToMove = new Set(team.units.filter(Boolean).map(u => u.id));
        // city.deployedUnits = city.deployedUnits.filter(u => !unitIdsToMove.has(u.id));
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

    const path = findWorldMapPath(startPoint, endPoint, worldMapGridRef, player.id);

    if (!path || path.length === 0) {
        showMessageCallback("找不到可行的行軍路徑！", "error");
        return;
    }

    const unitsWithSpeed = team.units.filter(u => u && u.movementSpeed > 0);
    if (unitsWithSpeed.length === 0) return showMessageCallback("隊伍中沒有可移動的單位！", "error");

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
    worldMapMarchesRef.push(march);

    showMessageCallback(`部隊 ${team.name} 已出發，預計 ${Math.round(totalDurationMs / 1000)} 秒後抵達！`, "success");
    onTeamUpdateCallback();
}

function handleMarchArrival(march) {
    const player = getCurrentPlayerRef();
    const team = player.cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) return;

    const arrivalCoords = march.path[march.path.length - 1];
    showMessageCallback(`部隊 ${team.name} 已抵達 (${arrivalCoords.row}, ${arrivalCoords.col})！`);
    team.marchTarget = null;
    
    onMarchEndCallback(march, team, arrivalCoords);
}

function processWorldMapMarches() {
    const now = Date.now();
    for (let i = worldMapMarchesRef.length - 1; i >= 0; i--) {
        const march = worldMapMarchesRef[i];
        if (now - march.startTime >= march.totalDuration) {
            worldMapMarchesRef.splice(i, 1);
            handleMarchArrival(march);
        }
    }
}

function handleStopMarch(march) {
    const marchIndex = worldMapMarchesRef.findIndex(m => m.id === march.id);
    if (marchIndex === -1) return;

    const team = getCurrentPlayerRef().cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) return;

    const pathLength = march.path.length - 1;
    const durationPerSegment = march.totalDuration / pathLength;
    const elapsed = Date.now() - march.startTime;
    const segmentIndex = Math.floor(elapsed / durationPerSegment);
    const currentPos = march.path[Math.min(segmentIndex, pathLength)];

    worldMapMarchesRef.splice(marchIndex, 1);

    team.status = 'garrisoned_on_tile';
    team.location = { type: 'tile', row: currentPos.row, col: currentPos.col };
    team.marchTarget = null;
    
    showMessageCallback(`${team.name} 已停止行軍並駐紮於 (${currentPos.row}, ${currentPos.col})。`, 'success');
    onTeamUpdateCallback(team, { row: currentPos.row, col: currentPos.col });
}

function handleReturnMarch(march) {
    const marchIndex = worldMapMarchesRef.findIndex(m => m.id === march.id);
    if (marchIndex === -1) return;

    const team = getCurrentPlayerRef().cities.flatMap(c => c.teams).find(t => t.id === march.teamId);
    if (!team) return;

    team.status = 'returning';
    team.marchTarget = { name: '返回中...' };

    worldMapMarchesRef.splice(marchIndex, 1);

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

        worldMapMarchesRef.push(returnMarch);
        showMessageCallback(`${team.name} 已取消行軍，正在返回起點。`, 'info');
    }
    onTeamUpdateCallback();
}


export const marchManager = {
    init: (dependencies) => {
        worldMapMarchesRef = dependencies.worldMapMarches;
        worldMapGridRef = dependencies.worldMapGrid;
        getCurrentPlayerRef = dependencies.getCurrentPlayer;
        showMessageCallback = dependencies.showMessage;
        onMarchEndCallback = dependencies.onMarchEnd;
        onTeamUpdateCallback = dependencies.onTeamUpdate;
    },
    startMarch,
    processWorldMapMarches,
    handleStopMarch,
    handleReturnMarch
};
