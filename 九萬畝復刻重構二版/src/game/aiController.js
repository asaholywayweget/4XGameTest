// src/game/aiController.js
// 職責：作為遊戲的 AI 大腦，集中處理所有單位的決策邏輯。

import { battleMapLogic } from './battleMapLogic.js'; // 從獨立的模組中引入

export const aiController = (() => {

    /**
     * 處理單一單位的回合，決定其行動
     * @param {object} unit - 當前回合的單位
     * @param {object} context - 戰鬥的上下文 (例如 cityData 或 resourceBattle)
     * @returns {object | null} - 回傳一個包含行動決策的物件，例如 { action: 'attack', target: ... } 或 { action: 'move', path: ... }
     */
    function processUnitTurn(unit, context) {
        if (unit.isMoving || unit.isAttacking) {
            return null; // 如果單位正在執行動作，則跳過
        }

        // 1. 尋找潛在目標
        const enemyUnits = context.deployedUnits.filter(u => u.ownerId !== unit.ownerId);
        const enemyStructures = context.structures.filter(s => s.ownerId !== unit.ownerId && s.currentHp > 0);
        
        // 優先攻擊單位，如果沒有單位則攻擊建築
        const potentialTargets = enemyUnits.length > 0 ? enemyUnits : enemyStructures;
        
        if (potentialTargets.length === 0) {
            return null; // 沒有目標，待機
        }

        // 2. 選擇最近的目標
        let closestTargetInfo = { target: null, distance: Infinity };
        potentialTargets.forEach(target => {
            // 取得目標的座標，處理單位和建築的不同
            const targetX = target.x ?? target.targetPoint?.x;
            const targetY = target.y ?? target.targetPoint?.y;
            if (targetX === undefined || targetY === undefined) return;

            const dist = Math.hypot(unit.x - targetX, unit.y - targetY);
            if (dist < closestTargetInfo.distance) {
                closestTargetInfo = { target, distance: dist };
            }
        });

        const { target } = closestTargetInfo;
        if (!target) {
            return null; // 找不到有效目標
        }

        // 3. 判斷是否在攻擊範圍內
        const attackRange = unit.attackRange?.base || unit.attackRange || 1;
        const isTargetInRange = closestTargetInfo.distance <= attackRange;

        if (isTargetInRange) {
            // 如果目標是建築，需要移動到相鄰的格子才能攻擊
            if (target.tag === 'building') {
                 if (!isUnitAdjacentToStructure(unit, target, context)) {
                    return findPathAndMove(unit, target, context);
                 }
            }
            // 在攻擊範圍內，回傳攻擊決策
            return { action: 'attack', target: target };
        } else {
            // 不在攻擊範圍內，尋找路徑並移動
            return findPathAndMove(unit, target, context);
        }
    }

    /**
     * 尋找移動路徑並回傳移動決策
     * @param {object} unit - 要移動的單位
     * @param {object} target - 目標
     * @param {object} context - 戰鬥上下文
     * @returns {object | null} - 移動決策或 null
     */
    function findPathAndMove(unit, target, context) {
        const obstacles = new Set(context.deployedUnits.filter(u => u.id !== unit.id).map(u => `${u.x},${u.y}`));
        
        // 獲取所有可能的攻擊站位點
        const allPossibleAttackSpots = getAttackSpots(target, context, obstacles);

        if (allPossibleAttackSpots.length === 0) {
            return null; // 沒有可以站立攻擊的位置
        }
        
        // 尋找通往最近攻擊點的最短路徑
        let shortestPath = null;
        for (const spot of allPossibleAttackSpots) {
            const path = battleMapLogic.findPath({ x: unit.x, y: unit.y }, spot, obstacles, context);
            if (path && (!shortestPath || path.length < shortestPath.length)) {
                shortestPath = path;
            }
        }

        if (shortestPath && shortestPath.length > 1) {
            // 根據單位移動力決定本次能移動的路徑
            const moveRange = unit.moveRange || 1;
            const finalStepIndex = Math.min(moveRange, shortestPath.length - 1);
            const pathToAnimate = shortestPath.slice(0, finalStepIndex + 1);
            
            // 回傳移動決策
            return { action: 'move', path: pathToAnimate };
        }

        return null; // 找不到路徑
    }

    /**
     * 判斷單位是否緊鄰一個建築目標
     */
    function isUnitAdjacentToStructure(unit, structure, context) {
        const attackSpots = getAttackSpots(structure, context, new Set());
        return attackSpots.some(spot => spot.x === unit.x && spot.y === unit.y);
    }

    /**
     * 獲取攻擊一個目標的所有有效相鄰格子
     */
    function getAttackSpots(target, context, obstacles) {
        let spots = [];
        if (target.type === 'wall') {
            // 如果是城牆，攻擊點是城門外圍
            target.gates.forEach(gate => {
                spots.push({ x: gate.x, y: gate.y - 1 }, { x: gate.x, y: gate.y + 1 }, { x: gate.x - 1, y: gate.y }, { x: gate.x + 1, y: gate.y });
            });
            const { minX, maxX, minY, maxY } = target.bounds;
            // 過濾掉無效、被佔據或在牆內的點
            return spots.filter(p => 
                p.x >= 0 && p.x < context.gridSizeX && p.y >= 0 && p.y < context.gridSizeY && 
                !obstacles.has(`${p.x},${p.y}`) && 
                !(p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY)
            );
        } else {
            // 其他目標，攻擊點是其周圍四格
            const targetX = target.x ?? target.targetPoint?.x;
            const targetY = target.y ?? target.targetPoint?.y;
            spots = [
                { x: targetX, y: targetY - 1 }, { x: targetX, y: targetY + 1 }, 
                { x: targetX - 1, y: targetY }, { x: targetX + 1, y: targetY }
            ];
             // 過濾掉無效或被佔據的點
            return spots.filter(p => 
                p.x >= 0 && p.x < context.gridSizeX && p.y >= 0 && p.y < context.gridSizeY && 
                !obstacles.has(`${p.x},${p.y}`)
            );
        }
    }

    // 公開 API
    return {
        processUnitTurn
    };
})();
