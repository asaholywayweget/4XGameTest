// src/game/worldState.js
// 職責：作為中立的持久化池，管理所有非玩家擁有的、存在於世界地圖上的實體，例如資源地的中立守軍。

import { getSoldiersForBuilding } from './soldierData.js';

const neutralGarrisons = {}; // 以 tile coordinate "row,col" 為 key

/**
 * 初始化中立世界狀態，為特定地塊生成守軍
 */
function initialize() {
    // 範例：為一個特定的敵方礦場生成一支固定的守軍
    const enemyGarrisonUnits = [
        { ...getSoldiersForBuilding("兵營")[0], ownerId: 'neutral_faction' },
        { ...getSoldiersForBuilding("兵營")[0], ownerId: 'neutral_faction' },
    ];
    addGarrison(2, 3, enemyGarrisonUnits); // 假設 (2,3) 是敵方礦場
    console.log("中立世界狀態池已初始化。");
}


/**
 * 為指定地塊添加一支守軍
 * @param {number} row - 地塊的行
 * @param {number} col - 地塊的列
 * @param {Array<object>} units - 組成守軍的單位陣列
 */
function addGarrison(row, col, units) {
    const key = `${row},${col}`;
    neutralGarrisons[key] = {
        id: `garrison_${key}`,
        units: units.map(u => ({ ...u, id: crypto.randomUUID(), currentHp: u.maxHp }))
    };
}

/**
 * 獲取指定地塊的守軍物件
 * @param {number} row - 地塊的行
 * @param {number} col - 地塊的列
 * @returns {object | undefined} 守軍物件或 undefined
 */
function getGarrison(row, col) {
    return neutralGarrisons[`${row},${col}`];
}

/**
 * 移除指定地塊的守軍
 * @param {number} row - 地塊的行
 * @param {number} col - 地塊的列
 */
function removeGarrison(row, col) {
    delete neutralGarrisons[`${row},${col}`];
}

export const worldState = {
    initialize,
    addGarrison,
    getGarrison,
    removeGarrison,
};
