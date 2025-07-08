// src/game/sessionManager.js
// 職責：管理玩家的遊戲會話，包括新玩家的數據創建、登入時的數據加載、登出時的數據清理及模擬模式。
// [數據同步修復] 修改了數據填充方式，不再重新賦值整個陣列，而是原地修改，以確保所有模組的參考保持同步。

import { worldGenerator } from './worldGenerator.js';
import { getSoldiersForBuilding } from './soldierData.js';
import { battleMapLogic } from './battleMapLogic.js';

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

function initPlayerSession(user, mockPlayerData, state, callbacks) {
    state.currentUser = user;
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
        
        if (callbacks.deployUnitToCityMap) {
            callbacks.deployUnitToCityMap(newUnit, initialCity);
        }
    }
    initialCity.teams.push(sampleTeam);

    // [核心修正] 使用原地修改的方式更新陣列，而不是重新賦值
    const newPlayersData = [{
        id: user.uid,
        name: mockPlayerData.name || `玩家_${user.uid.substring(0,4)}`,
        cities: [initialCity],
        gameSeed: mockPlayerData.gameSeed || Date.now().toString()
    }];
    state.playersData.length = 0; // 清空陣列
    Array.prototype.push.apply(state.playersData, newPlayersData); // 將新數據推入，保持參考不變

    const currentPlayerObject = state.playersData.find(p => p.id === user.uid);
    
    const newGridData = worldGenerator.generate(state.playersData, currentPlayerObject.gameSeed, user.uid);
    state.worldMapGrid.length = 0; // 清空陣列
    Array.prototype.push.apply(state.worldMapGrid, newGridData); // 將新數據推入，保持參考不變
    
    if (currentPlayerObject && currentPlayerObject.cities) {
        const newCoords = currentPlayerObject.cities.map(city => city.worldMapPosition).filter(pos => pos);
        state.playerCityCoordinates.length = 0; // 清空陣列
        Array.prototype.push.apply(state.playerCityCoordinates, newCoords); // 將新數據推入，保持參考不變
    }
    
    callbacks.onSessionStart();
}

function resetGameSession(state, callbacks) {
    state.currentUser = null;
    state.db = null;
    state.playersData.length = 0;
    state.worldMapGrid.length = 0;
    state.worldMapMarches.length = 0;
    state.playerCityCoordinates.length = 0;
    callbacks.onSessionEnd();
}

function runMockSession(state, callbacks) {
    console.warn("=== 警告：正在以模擬模式 (MOCK_MODE) 運行 ===");
    const mockUser = { uid: 'player_A', isAnonymous: true };
    const mockPlayerData = { name: `模擬玩家` };
    document.getElementById('auth-container')?.classList.add('hidden');
    initPlayerSession(mockUser, mockPlayerData, state, callbacks);
}

export const sessionManager = {
    initPlayerSession,
    resetGameSession,
    runMockSession,
    createNewCityInstance
};
