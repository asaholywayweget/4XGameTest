
// src/game/recruit.js
// 職責：管理所有士兵招募的 UI 互動、佇列和計時器邏輯。
// [行軍邏輯重構 V24.3]
// 1. 修正了 populateTroopList 的呼叫，傳遞完整的 player 物件而非 city 物件。
// 2. 在 init 中接收 getCurrentPlayer 的參考。

import { getSoldiersForBuilding } from './soldierData.js';
import { illustratedGuideModule } from './illustratedGuide.js';
import { troopListModule } from './troopList.js';

export const recruitModule = (() => {
    // --- 內部狀態 ---
    let isInitialized = false;
    let unitToRecruitAfterConfirm = null;
    let currentContainer = null;
    let buildingForTeamCreation = null;
    const recruitDom = {};
    const MAX_QUEUE_SIZE = 6;

    // --- 外部模組參考 ---
    let showMessage;
    let getCurrentCity;
    let getCurrentPlayer; // [新增]

    function init(dependencies) {
        if (isInitialized) return;
        showMessage = dependencies.showMessage;
        getCurrentCity = dependencies.getCurrentCity;
        getCurrentPlayer = dependencies.getCurrentPlayer; // [新增]

        const confirmBtn = document.getElementById('confirm-create-team-button');
        const cancelBtn = document.getElementById('cancel-create-team-button');
        if (confirmBtn) confirmBtn.addEventListener('click', handleConfirmCreateTeam);
        if (cancelBtn) cancelBtn.addEventListener('click', handleCancelCreateTeam);

        isInitialized = true;
        console.log("Recruit Module initialized (Refactored).");
    }

    function renderRecruitmentContent(container, building) {
        currentContainer = container;
        buildingForTeamCreation = building;
        
        container.innerHTML = `
            <h3 class="text-xl font-semibold mb-3 text-center">訓練單位</h3>
            <div id="recruit-unit-selection-list" class="flex flex-row overflow-x-auto pb-2 space-x-3 scrollbar-hidden"></div>
            <div id="recruit-unit-details" class="bg-gray-100 p-3 rounded-lg mt-4 hidden">
                <div class="flex items-center gap-4">
                    <img id="recruit-unit-image" src="" alt="單位圖像" class="w-16 h-16 rounded border">
                    <div class="flex-grow">
                        <div id="recruit-unit-name" class="font-bold text-lg"></div>
                        <div>訓練時間: <span id="recruit-unit-time"></span>秒</div>
                    </div>
                    <button id="recruit-train-button" class="btn-custom-base btn-custom-normal btn-small-size">訓練</button>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="font-semibold text-center mb-2">訓練佇列</h3>
                <div id="recruit-pre-training-slots" class="grid grid-cols-6 gap-2 justify-items-center"></div>
                <div id="total-training-time-container" class="text-center text-sm text-gray-600 mt-2"></div>
            </div>
        `;

        recruitDom.selectionList = container.querySelector('#recruit-unit-selection-list');
        recruitDom.details = container.querySelector('#recruit-unit-details');
        recruitDom.unitImage = container.querySelector('#recruit-unit-image');
        recruitDom.unitName = container.querySelector('#recruit-unit-name');
        recruitDom.unitTime = container.querySelector('#recruit-unit-time');
        recruitDom.trainButton = container.querySelector('#recruit-train-button');
        recruitDom.queueSlots = container.querySelector('#recruit-pre-training-slots');
        recruitDom.totalTimeContainer = container.querySelector('#total-training-time-container');

        populateUnitSelectionList(building.name);
        updateRecruitmentQueueDisplay();
    }

    function hideRecruitmentContent() {
        if (currentContainer) currentContainer.innerHTML = '';
        currentContainer = null;
        buildingForTeamCreation = null;
        unitToRecruitAfterConfirm = null;
    }

    function populateUnitSelectionList(buildingName) {
        const units = getSoldiersForBuilding(buildingName);
        recruitDom.selectionList.innerHTML = '';
        units.forEach(unit => {
            const item = document.createElement('div');
            item.className = 'flex flex-col items-center p-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 w-24 flex-shrink-0';
            item.innerHTML = `<img src="${unit.imageUrl}" alt="${unit.name}" class="w-16 h-16 object-cover rounded-md mb-1"><span class="text-sm font-semibold text-center w-full truncate">${unit.name}</span>`;
            item.addEventListener('click', () => selectUnitForTraining(unit));
            recruitDom.selectionList.appendChild(item);
        });
    }

    function selectUnitForTraining(unit) {
        recruitDom.details.classList.remove('hidden');
        recruitDom.unitImage.src = unit.imageUrl;
        recruitDom.unitName.textContent = unit.name;
        recruitDom.unitTime.textContent = unit.trainingTime;
        recruitDom.trainButton.onclick = () => confirmTrainUnit(unit);
    }

    function findFirstAvailableSlot() {
        const city = getCurrentCity();
        if (!city || !city.teams) return null;
        const fullQueue = Object.values(city.preTrainingQueue).flat();
        for (let i = 0; i < city.teams.length; i++) {
            for (let j = 0; j < 9; j++) {
                const isSlotOccupiedByCompletedUnit = city.teams[i].units[j] !== null;
                const isSlotOccupiedByTrainingUnit = fullQueue.some(item => item.teamIndex === i && item.slotIndex === j);
                if (!isSlotOccupiedByCompletedUnit && !isSlotOccupiedByTrainingUnit) {
                    return { teamIndex: i, slotIndex: j };
                }
            }
        }
        return null;
    }

    function confirmTrainUnit(unit) {
        const city = getCurrentCity();
        const queue = city.preTrainingQueue[buildingForTeamCreation.name] || [];
        if (queue.length >= MAX_QUEUE_SIZE) { showMessage("此建築的訓練佇列已滿！", "error"); return; }
        const availableSlot = findFirstAvailableSlot();
        if (availableSlot) {
            addUnitToQueue(unit, availableSlot.teamIndex, availableSlot.slotIndex);
        } else {
            if (!city.teams || city.teams.length < 5) { 
                unitToRecruitAfterConfirm = unit; 
                document.getElementById('create-team-confirm-modal-overlay').classList.remove('hidden'); 
            } else { 
                showMessage("所有隊伍均已滿，無法訓練新單位。", "error"); 
            }
        }
    }

    function handleConfirmCreateTeam() {
        const city = getCurrentCity();
        if (!city) return;
        if (!city.teams) city.teams = [];

        const newTeam = { 
            id: `team_${crypto.randomUUID()}`,
            name: `隊伍${city.teams.length + 1}`, 
            units: Array(9).fill(null),
            status: 'garrisoned_in_city', 
            location: { type: 'city' } 
        };

        city.teams.push(newTeam);
        showMessage(`已創建新隊伍：${newTeam.name}！`, "success");
        if (unitToRecruitAfterConfirm) {
            addUnitToQueue(unitToRecruitAfterConfirm, city.teams.length - 1, 0);
            unitToRecruitAfterConfirm = null;
        }
        document.getElementById('create-team-confirm-modal-overlay').classList.add('hidden');
    }

    function handleCancelCreateTeam() {
        unitToRecruitAfterConfirm = null;
        document.getElementById('create-team-confirm-modal-overlay').classList.add('hidden');
    }

    function addUnitToQueue(unit, teamIndex, slotIndex) {
        const city = getCurrentCity();
        const queue = city.preTrainingQueue[buildingForTeamCreation.name] || [];
        const newQueueItem = { id: crypto.randomUUID(), unitData: unit, teamIndex, slotIndex, buildingName: buildingForTeamCreation.name };
        if (queue.length === 0) {
            newQueueItem.startTime = Date.now();
        }
        queue.push(newQueueItem);
        city.preTrainingQueue[buildingForTeamCreation.name] = queue;
        showMessage(`${unit.name} 已加入訓練佇列。`, "success");
        updateRecruitmentQueueDisplay();
        // [BUG FIX] 傳遞完整的 player 物件
        troopListModule.populateTroopList(getCurrentPlayer());
    }

    function updateRecruitmentQueueDisplay() {
        if (!recruitDom.queueSlots || !buildingForTeamCreation) return;
        const city = getCurrentCity();
        const queue = city.preTrainingQueue[buildingForTeamCreation.name] || [];
        recruitDom.queueSlots.innerHTML = '';
        for (let i = 0; i < MAX_QUEUE_SIZE; i++) {
            const item = queue[i];
            const slot = document.createElement('div');
            slot.className = 'relative w-16 h-16 bg-gray-200 border border-gray-300 rounded-md flex items-center justify-center';
            if (item) {
                let remaining = item.unitData.trainingTime;
                let progress = 0;
                if (i === 0 && item.startTime) {
                    const elapsed = (Date.now() - item.startTime) / 1000;
                    remaining = Math.max(0, item.unitData.trainingTime - elapsed);
                    progress = (item.unitData.trainingTime - remaining) / item.unitData.trainingTime;
                }
                const progressHeight = Math.min(100, progress * 100);
                slot.classList.add('cursor-pointer', 'hover:ring-2', 'hover:ring-red-500', 'overflow-hidden');
                slot.innerHTML = `
                    <div class="absolute bottom-0 left-0 w-full bg-blue-500" style="height: ${progressHeight}%; z-index: 1;"></div>
                    <img src="${item.unitData.imageUrl}" alt="${item.unitData.name}" class="w-12 h-12 rounded-full relative z-10" style="filter: brightness(60%);">
                    <span class="absolute bottom-1 text-xs font-bold text-white z-20" style="text-shadow: 1px 1px 2px black;">${Math.ceil(remaining)}s</span>
                `;
                slot.addEventListener('click', () => {
                    illustratedGuideModule.showSoldierDetail(item.unitData, { fromRecruitment: true, queueIndex: i, buildingName: item.buildingName });
                });
            } else {
                slot.innerHTML = `<span class="text-gray-400 text-sm">空</span>`;
            }
            recruitDom.queueSlots.appendChild(slot);
        }
        calculateAndDisplayTotalTime();
    }

    function calculateAndDisplayTotalTime() {
        if (!recruitDom.totalTimeContainer || !buildingForTeamCreation) return;
        const city = getCurrentCity();
        const queue = city.preTrainingQueue[buildingForTeamCreation.name] || [];
        if (queue.length === 0) { recruitDom.totalTimeContainer.textContent = ''; return; }
        let totalSeconds = 0;
        if (queue[0] && queue[0].startTime) {
            const elapsed = (Date.now() - queue[0].startTime) / 1000;
            totalSeconds += Math.max(0, queue[0].unitData.trainingTime - elapsed);
        }
        for (let i = 1; i < queue.length; i++) {
            totalSeconds += queue[i].unitData.trainingTime;
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.ceil(totalSeconds % 60);
        recruitDom.totalTimeContainer.textContent = `總訓練時間: ${hours > 0 ? hours + '時' : ''} ${minutes > 0 ? minutes + '分' : ''} ${seconds}秒`;
    }

    function cancelRecruitment(index, buildingName) {
        const city = getCurrentCity();
        const queue = city.preTrainingQueue[buildingName];
        if (!queue || !queue[index]) return;
        const canceledUnit = queue.splice(index, 1)[0];
        const { teamIndex } = canceledUnit;
        const targetTeam = city.teams[teamIndex];
        if (index === 0 && queue.length > 0) {
            queue[0].startTime = Date.now();
        }
        showMessage(`已取消招募 ${canceledUnit.unitData.name}。`, 'success');
        updateRecruitmentQueueDisplay();
        troopListModule.populateTroopList(getCurrentPlayer());
        if (targetTeam) {
            const isAnotherUnitInQueueForTeam = Object.values(city.preTrainingQueue).flat().some(item => item.teamIndex === teamIndex);
            const hasExistingUnitsInTeam = targetTeam.units.some(unit => unit !== null);
            if (!isAnotherUnitInQueueForTeam && !hasExistingUnitsInTeam) {
                city.teams.splice(teamIndex, 1);
                showMessage(`由於隊伍已空，${targetTeam.name} 已被自動解散。`, 'info');
                troopListModule.populateTroopList(getCurrentPlayer());
            }
        }
    }

    return {
        init,
        renderRecruitmentContent,
        hideRecruitmentContent,
        cancelRecruitment,
        updateRecruitmentQueueDisplay
    };
})();
