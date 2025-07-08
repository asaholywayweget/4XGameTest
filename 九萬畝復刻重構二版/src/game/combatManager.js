// src/game/combatManager.js
// 職責：管理所有戰鬥的生命週期，包括開始、過程處理、勝負判斷和結束結算。
// [架構重構] 修改戰鬥邏輯，使其直接操作傳入的持久化物件參考，而非臨時副本。

import { aiController } from './aiController.js';
import { animationManager } from './animationManager.js';

export const combatManager = (() => {
    let turnCounters = {};
    let nextTurnTime = {};
    let activeBattlesRef;
    let showMessageCallback;
    let onCombatEndCallback;

    function init(dependencies) {
        activeBattlesRef = dependencies.activeBattles;
        showMessageCallback = dependencies.showMessage;
        onCombatEndCallback = dependencies.onCombatEnd;
    }

    /**
     * [重構] 啟動戰鬥，現在的 context 包含對持久化物件的直接參考
     * @param {object} battleContext - 包含 attackerTeamRef 和 defenderRef 的物件
     */
    function startCombat(battleContext) {
        const battleId = `battle_${battleContext.defenderRef.row}_${battleContext.defenderRef.col}`;
        if (activeBattlesRef[battleId]) return;

        const context = {
            id: battleId,
            name: `資源地 (${battleContext.defenderRef.row}, ${battleContext.defenderRef.col}) 爭奪戰`,
            isBattleActive: true,
            attackerTeamRef: battleContext.attackerTeamRef, // 對玩家隊伍的參考
            defenderRef: battleContext.defenderRef,         // 對地塊或其中立守軍的參考
            type: 'resourceBattle',
            sourceTile: battleContext.defenderRef // 將地塊本身作為 sourceTile
        };
        
        activeBattlesRef[battleId] = context;
        turnCounters[battleId] = 0;
        nextTurnTime[battleId] = Date.now();
        showMessageCallback(`${context.name} 開始！`, 'info');
    }

    function stopCombat(context, result, winnerId = null) {
        if (!context.isBattleActive) return;
        context.isBattleActive = false;
        delete activeBattlesRef[context.id];
        delete nextTurnTime[context.id];
        
        if (onCombatEndCallback) {
            onCombatEndCallback(context, result, winnerId);
        }
    }

    function attack(attacker, defender) {
        if (!defender) return;
        animationManager.startAttackAnimation(attacker, () => {
            let damage = (defender.tag === 'building') ? 3 : (attacker.ap || 10);
            defender.currentHp -= damage;
            if (defender.currentHp <= 0) {
                defender.currentHp = 0;
            }
        });
    }

    function processAllCombats() {
        for (const battleId in activeBattlesRef) {
            processSingleCombat(activeBattlesRef[battleId]);
        }
    }

    function processSingleCombat(context) {
        if (!context || !context.isBattleActive || animationManager.isActionInProgress()) return;
        if (Date.now() < nextTurnTime[context.id]) return;

        // [重構] 直接從參考中獲取單位
        const attackingUnits = context.attackerTeamRef.units.filter(u => u && u.currentHp > 0);
        const defendingUnits = context.defenderRef.units ? context.defenderRef.units.filter(u => u && u.currentHp > 0) : [];
        
        // 更新單位陣列，以便 AI 決策
        context.deployedUnits = [...attackingUnits, ...defendingUnits];

        // 檢查結束條件
        if (defendingUnits.length === 0) {
            stopCombat(context, 'win', context.attackerTeamRef.ownerId);
            return;
        }
        if (attackingUnits.length === 0) {
            stopCombat(context, 'fail', defendingUnits[0]?.ownerId || 'neutral_faction');
            return;
        }

        const unitsInTurnOrder = [...context.deployedUnits].sort((a, b) => a.id.localeCompare(b.id));
        if (unitsInTurnOrder.length > 0) {
            const turnIndex = turnCounters[context.id] || 0;
            const currentUnit = unitsInTurnOrder[turnIndex % unitsInTurnOrder.length];

            if (currentUnit) {
                const decision = aiController.processUnitTurn(currentUnit, context);
                if (decision && decision.action === 'attack') {
                    attack(currentUnit, decision.target);
                }
            }
            turnCounters[context.id] = (turnIndex + 1);
            nextTurnTime[context.id] = Date.now() + 500;
        }
    }

    return {
        init,
        startCombat,
        stopCombat,
        processAllCombats
    };
})();
