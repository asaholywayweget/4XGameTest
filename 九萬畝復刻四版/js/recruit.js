// recruit.js
// This module handles all soldier recruitment logic, including unit selection,
// managing recruitment queues for different buildings, and team assignment.

// --- Module State Variables (private to this module) ---
let moduleState = {
    _unitToRecruitAfterConfirm: null, // Holds unit data when a new team needs confirmation
    _currentDisplayedUnit: null, // The unit currently displayed in the recruitment modal
    _currentRecruitingBuilding: null, // The building (Barracks, Stable, Factory) that initiated the recruitment modal
    _recruitmentTimerInterval: null, // Interval for updating recruitment timers
    _unitToCancel: null, // Temporarily stores unit data for cancellation confirmation

    // References to data/functions from other modules, passed during init
    _allSoldiersData: [], // Reference to all soldier data (read-only)
    _showMessage: null, // Function to display game messages
    _updateAnalysisCharts: null, // Function to trigger chart updates in main.js
    _getCurrentCityData: null, // NEW: Callback to get the current city's data from main.js

    MAX_TEAMS_LIMIT: 14, // Constant for max teams
    RECRUITMENT_QUEUE_LIMIT: 6 // Max units in a single building's recruitment queue
};

// --- DOM Element References (from buildings.js or main.js, passed during init) ---
let unitTrainingModalOverlay, unitTrainingModalContent, unitModalCloseButton;
let unitSelectionListContainer, unitSelectionPlaceholder, unitItemContainerWrapper;
let unitImage, unitSecondaryImage, unitName, unitTrainingTime, unitSpeed, unitMovementSpeed, unitResourcesDisplayValue;
let trainUnitButton, preTrainingSlotsContainer, preTrainingSubSlotsContainer;
let speedDownButton, speedUpButton;
let createTeamConfirmModalOverlay, createTeamMessage, cancelCreateTeamButton, confirmCreateTeamButton;
let cancelRecruitmentConfirmModalOverlay, cancelRecruitmentConfirmMessage,
    cancelRecruitmentConfirmButton, cancelRecruitmentCancelButton;

/**
 * Initializes the recruit module by receiving necessary references and DOM elements.
 * This function is called by buildings.js.
 * @param {Object} params - An object containing all necessary parameters.
 */
export function initRecruit(params) {
    // Assign references to moduleState
    moduleState._allSoldiersData = params.allSoldiersData;
    moduleState._showMessage = params.showMessage;
    moduleState._updateAnalysisCharts = params.updateAnalysisCharts;
    moduleState._getCurrentCityData = params.getCurrentCityData; 

    // Assign DOM elements
    unitTrainingModalOverlay = params.unitTrainingModalOverlay;
    unitTrainingModalContent = params.unitTrainingModalContent;
    unitModalCloseButton = params.unitModalCloseButton;
    unitSelectionListContainer = params.unitSelectionListContainer;
    unitSelectionPlaceholder = params.unitSelectionPlaceholder;
    unitItemContainerWrapper = params.unitItemContainerWrapper;
    unitImage = params.unitImage;
    unitSecondaryImage = params.unitSecondaryImage;
    unitName = params.unitName;
    unitTrainingTime = params.unitTrainingTime; 
    unitSpeed = params.unitSpeed;
    unitMovementSpeed = params.unitMovementSpeed; // Corrected: Use params.unitMovementSpeed
    unitResourcesDisplayValue = params.unitResourcesDisplayValue;
    trainUnitButton = params.trainUnitButton;
    preTrainingSlotsContainer = params.preTrainingSlotsContainer;
    preTrainingSubSlotsContainer = params.preTrainingSubSlotsContainer;
    speedDownButton = params.speedDownButton;
    speedUpButton = params.speedUpButton;
    createTeamConfirmModalOverlay = params.createTeamConfirmModalOverlay;
    createTeamMessage = params.createTeamMessage;
    cancelCreateTeamButton = params.cancelCreateTeamButton;
    confirmCreateTeamButton = params.confirmCreateTeamButton;
    cancelRecruitmentConfirmModalOverlay = document.getElementById('cancel-recruitment-confirm-modal-overlay');
    cancelRecruitmentConfirmMessage = document.getElementById('cancel-recruitment-message');
    cancelRecruitmentConfirmButton = document.getElementById('confirm-cancel-recruitment-button');
    cancelRecruitmentCancelButton = document.getElementById('cancel-cancel-recruitment-button');

    // Setup event listeners
    if (unitTrainingModalOverlay) unitTrainingModalOverlay.addEventListener('click', (e) => e.target === unitTrainingModalOverlay && hideRecruitModal());
    if (unitModalCloseButton) unitModalCloseButton.addEventListener('click', hideRecruitModal);
    if (trainUnitButton) trainUnitButton.addEventListener('click', _handleRecruitUnit);
    if (speedDownButton) speedDownButton.addEventListener('click', _handleSpeedChange);
    if (speedUpButton) speedUpButton.addEventListener('click', _handleSpeedChange);
    if (cancelCreateTeamButton) cancelCreateTeamButton.addEventListener('click', _handleCancelCreateTeam);
    if (confirmCreateTeamButton) confirmCreateTeamButton.addEventListener('click', _handleConfirmCreateTeam);
    if (cancelRecruitmentConfirmModalOverlay) cancelRecruitmentConfirmModalOverlay.addEventListener('click', (e) => e.target === cancelRecruitmentConfirmModalOverlay && _hideCancelRecruitmentConfirmModal());
    if (cancelRecruitmentConfirmButton) cancelRecruitmentConfirmButton.addEventListener('click', _confirmCancelRecruitment);
    if (cancelRecruitmentCancelButton) cancelRecruitmentCancelButton.addEventListener('click', _hideCancelRecruitmentConfirmModal);

    moduleState._recruitmentTimerInterval = setInterval(_updateRecruitmentTimers, 1000);
}

export function isRecruitModalVisible() {
    return unitTrainingModalOverlay && !unitTrainingModalOverlay.classList.contains('hidden');
}

export function isCreateTeamConfirmModalVisible() {
    return createTeamConfirmModalOverlay && !createTeamConfirmModalOverlay.classList.contains('hidden');
}

export function isCancelRecruitmentConfirmModalVisible() {
    return cancelRecruitmentConfirmModalOverlay && !cancelRecruitmentConfirmModalOverlay.classList.contains('hidden');
}

export function showRecruitModal(buildingData) {
    if (!unitTrainingModalOverlay) {
        moduleState._showMessage('招募模態框DOM元素未準備好。', 'error');
        return;
    }
    moduleState._currentRecruitingBuilding = buildingData;
    const currentCity = moduleState._getCurrentCityData();
    if (!currentCity.preTrainingQueue[buildingData.name]) {
        currentCity.preTrainingQueue[buildingData.name] = [];
    }
    unitTrainingModalOverlay.classList.remove('hidden');
    _populateUnitSelectionList();
    moduleState._currentDisplayedUnit = null; 
    if (unitItemContainerWrapper) unitItemContainerWrapper.classList.add('hidden');
    if (unitSelectionPlaceholder) unitSelectionPlaceholder.classList.remove('hidden'); 
    _populateRecruitmentQueueDisplay(); 
}

function hideRecruitModal() {
    if (unitTrainingModalOverlay) unitTrainingModalOverlay.classList.add('hidden');
    moduleState._currentDisplayedUnit = null;
    moduleState._currentRecruitingBuilding = null;
}

function _populateUnitSelectionList() {
    if (!unitSelectionListContainer || !unitSelectionPlaceholder || !unitItemContainerWrapper) return;

    unitSelectionListContainer.innerHTML = '';
    const trainableUnits = moduleState._allSoldiersData.filter(unit => 
        moduleState._currentRecruitingBuilding && unit.trainingBuilding === moduleState._currentRecruitingBuilding.name
    );

    if (trainableUnits.length === 0) {
        unitSelectionPlaceholder.innerText = '此處尚無可招募的單位。';
        unitSelectionPlaceholder.classList.remove('hidden');
        unitItemContainerWrapper.classList.add('hidden');
        return;
    } else {
        unitSelectionPlaceholder.classList.add('hidden');
    }

    trainableUnits.forEach(unit => {
        if (unit.researchLvl === 0 && unit.smithLvl === 0) {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-selection-card bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-150';
            unitCard.innerHTML = `
                <img src="${unit.imageUrl}" alt="${unit.name}圖像" class="w-16 h-16 object-cover rounded-md border border-gray-300 mb-2">
                <div class="font-semibold text-base text-gray-800 text-center">${unit.name}</div>
            `;
            unitCard.addEventListener('click', () => _selectUnitForRecruitment(unit));
            unitSelectionListContainer.appendChild(unitCard);
        }
    });

    if (moduleState._currentDisplayedUnit) {
        const cards = unitSelectionListContainer.querySelectorAll('.unit-selection-card');
        cards.forEach(card => {
            if (card.querySelector('.font-semibold').innerText === moduleState._currentDisplayedUnit.name) {
                card.classList.add('selected');
            }
        });
    }
}

function _selectUnitForRecruitment(unit) {
    if (!unitImage || !unitName || !unitTrainingTime) return;
    moduleState._currentDisplayedUnit = unit;
    
    unitSelectionListContainer.querySelectorAll('.unit-selection-card').forEach(card => {
        card.classList.toggle('selected', card.querySelector('.font-semibold').innerText === unit.name);
    });

    unitImage.src = unit.imageUrl;
    unitImage.onerror = function() { this.src = `https://placehold.co/64x64/D3D3D3/666666?text=${unit.name.substring(0, 2)}`; };
    unitName.innerText = unit.name;
    unitTrainingTime.innerText = unit.trainingTime;
    unitSpeed.innerText = unit.speed;
    unitMovementSpeed.innerText = unit.movementSpeed;
    unitResourcesDisplayValue.innerText = `糧食:${unit.resources.food} 木頭:${unit.resources.wood} 石頭:${unit.resources.stone}`;

    unitSelectionPlaceholder.classList.add('hidden');
    unitItemContainerWrapper.classList.remove('hidden');
}

function _handleSpeedChange(event) {
    if (!moduleState._currentDisplayedUnit || !unitSpeed) return;
    let newSpeed = moduleState._currentDisplayedUnit.speed;
    if (event.target.id === 'speed-down-button') {
        newSpeed = Math.max(1, newSpeed - 1);
    } else if (event.target.id === 'speed-up-button') {
        newSpeed = Math.min(9, newSpeed + 1);
    }
    moduleState._currentDisplayedUnit.speed = newSpeed;
    unitSpeed.innerText = newSpeed;
}

function _handleRecruitUnit() {
    const unitData = moduleState._currentDisplayedUnit;
    if (!unitData) {
        moduleState._showMessage('請先選擇一個單位進行招募！', 'error');
        return;
    }
    const currentBuildingName = moduleState._currentRecruitingBuilding?.name;
    if (!currentBuildingName) {
        moduleState._showMessage('未能識別當前招募建築。', 'error');
        return;
    }

    const currentCity = moduleState._getCurrentCityData();
    const currentTeams = currentCity.teams;
    const currentBuildingQueue = currentCity.preTrainingQueue[currentBuildingName];

    if (currentBuildingQueue.length >= moduleState.RECRUITMENT_QUEUE_LIMIT) {
        moduleState._showMessage('此招募建築區塊已滿，請稍後再試！', 'error');
        return;
    }

    let targetTeamIndex = -1, targetSlotIndex = -1;

    for (let i = 0; i < currentTeams.length; i++) {
        const emptySlot = currentTeams[i].units.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            targetTeamIndex = i;
            targetSlotIndex = emptySlot;
            break;
        }
    }

    if (targetTeamIndex === -1) { // No empty slot found in any existing team
        if (currentTeams.length >= moduleState.MAX_TEAMS_LIMIT) {
            moduleState._showMessage(`已達到隊伍上限 (${moduleState.MAX_TEAMS_LIMIT} 隊)。`, 'error');
            return;
        }
        moduleState._unitToRecruitAfterConfirm = unitData;
        const proposedTeamName = _generateNextTeamName();
        if (createTeamMessage) {
            createTeamMessage.innerText = `所有隊伍都已滿。是否創建新隊伍『${proposedTeamName}』並招募士兵？`;
        }
        _showCreateTeamConfirmModal();
    } else {
        // Corrected: Use targetSlotIndex instead of slotIndex
        _addUnitToQueue(unitData, targetTeamIndex, targetSlotIndex);
    }
}

function _addUnitToQueue(unitData, teamIndex, slotIndex) {
    const currentCity = moduleState._getCurrentCityData();
    const currentBuildingName = moduleState._currentRecruitingBuilding.name;
    const currentBuildingQueue = currentCity.preTrainingQueue[currentBuildingName];
    
    let unitInTeamObject = {
        ...unitData,
        inRecruitment: true,
        recruitingBuilding: currentBuildingName,
    };
    currentCity.teams[teamIndex].units[slotIndex] = unitInTeamObject;

    const lastUnitInQueue = currentBuildingQueue[currentBuildingQueue.length - 1];
    const startTime = lastUnitInQueue ? lastUnitInQueue.finishTime : Date.now();
    const finishTime = startTime + unitData.trainingTime * 1000;
    
    currentBuildingQueue.push({ 
        unitObject: unitInTeamObject, 
        finishTime: finishTime, 
        buildingName: currentBuildingName, 
        teamIndex: teamIndex, 
        slotIndex: slotIndex 
    });
    
    _populateRecruitmentQueueDisplay();
    moduleState._updateAnalysisCharts();
    moduleState._showMessage(`已將『${unitData.name}』加入招募佇列！`, 'success');
}

function _showCreateTeamConfirmModal() {
    if (createTeamConfirmModalOverlay) createTeamConfirmModalOverlay.classList.remove('hidden');
}

function _hideCreateTeamConfirmModal() {
    if (createTeamConfirmModalOverlay) createTeamConfirmModalOverlay.classList.add('hidden');
}

function _handleCancelCreateTeam() {
    moduleState._unitToRecruitAfterConfirm = null;
    _hideCreateTeamConfirmModal();
    moduleState._showMessage('已取消創建隊伍。', 'error');
}

function _handleConfirmCreateTeam() {
    if (!moduleState._unitToRecruitAfterConfirm) return;

    const currentCity = moduleState._getCurrentCityData();
    const currentTeams = currentCity.teams;

    if (currentTeams.length >= moduleState.MAX_TEAMS_LIMIT) {
        moduleState._showMessage(`已達到隊伍上限 (${moduleState.MAX_TEAMS_LIMIT} 隊)。`, 'error');
    } else {
        const newTeamName = _generateNextTeamName();
        const newTeamIndex = currentTeams.length;
        currentTeams.push({ name: newTeamName, units: Array(9).fill(null) });
        _addUnitToQueue(moduleState._unitToRecruitAfterConfirm, newTeamIndex, 0);
    }
    _hideCreateTeamConfirmModal();
    moduleState._unitToRecruitAfterConfirm = null;
}

function _populateRecruitmentQueueDisplay() {
    if (!preTrainingSlotsContainer || !preTrainingSubSlotsContainer) return;

    preTrainingSlotsContainer.innerHTML = '';
    preTrainingSubSlotsContainer.innerHTML = '';

    const currentBuildingName = moduleState._currentRecruitingBuilding?.name;
    const currentCity = moduleState._getCurrentCityData();
    const currentBuildingQueue = currentCity.preTrainingQueue[currentBuildingName] || [];

    for (let i = 0; i < moduleState.RECRUITMENT_QUEUE_LIMIT; i++) {
        const unitSlot = document.createElement('div');
        unitSlot.className = 'w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md relative overflow-hidden bg-gray-200';
        const subSlot = document.createElement('div');
        subSlot.className = 'w-12 h-4 rounded-sm flex items-center justify-center relative overflow-hidden text-xs font-medium text-gray-700 bg-gray-200 hidden';
        subSlot.id = `recruitment-timer-${currentBuildingName}-${i}`;
        
        if (currentBuildingQueue[i]) {
            const unitItem = currentBuildingQueue[i];
            const unitFullData = unitItem.unitObject;
            if (unitFullData) {
                unitSlot.classList.remove('bg-gray-200');
                unitSlot.title = `${unitFullData.name} (招募中)\n點擊取消`;
                unitSlot.innerHTML = `<div class="absolute w-4/5 h-4/5 rounded-sm flex items-center justify-center text-white text-xs font-bold" style="background-color: hsl(120, 100%, 12%); opacity:0.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${unitFullData.name.substring(0, 1)}</div>`;
                const remainingTime = Math.max(0, Math.ceil((unitItem.finishTime - Date.now()) / 1000));
                subSlot.innerText = _formatTime(remainingTime);
                subSlot.classList.remove('hidden', 'bg-gray-200');
                subSlot.classList.add('bg-blue-200');
                unitSlot.style.cursor = 'pointer';
                unitSlot.onclick = () => _showCancelRecruitmentConfirmModal(unitItem, i, currentBuildingName);
            }
        }
        preTrainingSlotsContainer.appendChild(unitSlot);
        preTrainingSubSlotsContainer.appendChild(subSlot);
    }
}

function _showCancelRecruitmentConfirmModal(unitItem, indexInQueue, buildingName) {
    if (!cancelRecruitmentConfirmModalOverlay || !cancelRecruitmentConfirmMessage) return;
    moduleState._unitToCancel = { unitItem, indexInQueue, buildingName };
    cancelRecruitmentConfirmMessage.innerHTML = `確定要取消『<span class="font-bold text-blue-700">${unitItem.unitObject.name}</span>』的招募嗎？<br>資源將全額返還。`;
    cancelRecruitmentConfirmModalOverlay.classList.remove('hidden');
}

function _hideCancelRecruitmentConfirmModal() {
    if (cancelRecruitmentConfirmModalOverlay) {
        cancelRecruitmentConfirmModalOverlay.classList.add('hidden');
        moduleState._unitToCancel = null;
    }
}

function _confirmCancelRecruitment() {
    if (!moduleState._unitToCancel) return;

    const { unitItem, indexInQueue, buildingName } = moduleState._unitToCancel;
    const unitFullData = unitItem.unitObject;
    const currentCity = moduleState._getCurrentCityData();
    const currentBuildingQueue = currentCity.preTrainingQueue[buildingName];

    if (currentBuildingQueue) {
        currentBuildingQueue.splice(indexInQueue, 1);
    }
    if (unitItem.teamIndex !== undefined && unitItem.slotIndex !== undefined) {
        const currentTeams = currentCity.teams;
        if (currentTeams[unitItem.teamIndex] && currentTeams[unitItem.teamIndex].units[unitItem.slotIndex] === unitFullData) {
            currentTeams[unitItem.teamIndex].units[unitItem.slotIndex] = null;
        }
    }

    // Resources refund is conceptual
    moduleState._showMessage(`已取消『${unitFullData.name}』的招募，資源已返還。`, 'success');
    _populateRecruitmentQueueDisplay();
    moduleState._updateAnalysisCharts();
    _hideCancelRecruitmentConfirmModal();
}

function _updateRecruitmentTimers() {
    let globalSomethingFinished = false;
    const currentCity = moduleState._getCurrentCityData();
    if(!currentCity) return;
    
    const allRecruitmentQueues = currentCity.preTrainingQueue;

    for (const buildingName in allRecruitmentQueues) {
        if (Object.hasOwnProperty.call(allRecruitmentQueues, buildingName)) {
            let currentQueue = allRecruitmentQueues[buildingName];
            for (let i = currentQueue.length - 1; i >= 0; i--) {
                const unitItem = currentQueue[i];
                if (Date.now() >= unitItem.finishTime) {
                    _finishRecruitingUnit(unitItem, buildingName, i);
                    globalSomethingFinished = true;
                } else {
                     const timerElement = document.getElementById(`recruitment-timer-${buildingName}-${i}`);
                     if(timerElement) {
                        const remainingTime = Math.max(0, Math.ceil((unitItem.finishTime - Date.now()) / 1000));
                        timerElement.innerText = _formatTime(remainingTime);
                     }
                }
            }
        }
    }

    if (globalSomethingFinished) {
        if (moduleState._currentRecruitingBuilding) {
            _populateRecruitmentQueueDisplay();
        }
        moduleState._updateAnalysisCharts();
    }
}

/**
 * Finds an available position for a soldier using a Breadth-First Search (BFS) approach.
 * This ensures soldiers are placed in the nearest available "城外" (outside city wall) spots.
 * @returns {{row: number, col: number}|null} The available position or null if none.
 */
function _findAvailableStagingPosition() {
    const city = moduleState._getCurrentCityData();
    const cityGridSize = 17; // Assuming this is defined or passed, matching main.js

    // Define the boundaries for the main city's 'inner earth' (建築區) and 'middle earth' (城牆區).
    // Soldiers should NOT be placed in these areas.
    const cityInnerMinRow = city.MAIN_CITY_MIN_ROW; // 6
    const cityInnerMaxRow = city.MAIN_CITY_MAX_ROW; // 10
    const cityInnerMinCol = city.MAIN_CITY_MIN_COL; // 6
    const cityInnerMaxCol = city.MAIN_CITY_MAX_COL; // 10

    // The 'city wall' area effectively extends one cell beyond the inner earth.
    // So, soldiers must be placed outside (cityInnerMinRow - 1) to (cityInnerMaxRow + 1)
    // and (cityInnerMinCol - 1) to (cityInnerMaxCol + 1).
    const cityExclusionMinRow = cityInnerMinRow - 1; // 5
    const cityExclusionMaxRow = cityInnerMaxRow + 1; // 11
    const cityExclusionMinCol = cityInnerMinCol - 1; // 5
    const cityExclusionMaxCol = cityInnerMaxCol + 1; // 11

    // Starting point: One cell directly below the effective city wall boundary, at the center column.
    const startRow = cityExclusionMaxRow + 1; // 12
    const startCol = Math.floor((cityInnerMinCol + cityInnerMaxCol) / 2); // 8 (center of inner city)

    const queue = [{r: startRow, c: startCol}];
    const visited = new Set();
    visited.add(`${startRow},${startCol}`);

    // Define directions for BFS: Up, Left, Down, Right (for layered expansion)
    const directions = [
        {dr: -1, dc: 0}, // Up
        {dr: 0, dc: -1}, // Left
        {dr: 1, dc: 0},  // Down
        {dr: 0, dc: 1}   // Right
    ];

    let head = 0;
    while(head < queue.length) {
        const {r, c} = queue[head++];

        // Check if the current cell is within map bounds
        const isInBounds = r >= 0 && r < cityGridSize && c >= 0 && c < cityGridSize;

        // Check if the current cell is outside the defined city/wall exclusion zone
        const isOutsideCityAndWall = 
            r < cityExclusionMinRow || r > cityExclusionMaxRow || 
            c < cityExclusionMinCol || c > cityExclusionMaxCol;

        // Collect all occupied cells, including existing soldiers and buildings
        const occupiedCells = new Set();
        city.placedBuildings.forEach(b => occupiedCells.add(`${b.row},${b.col}`));
        city.teams.forEach(team => {
            team.units.forEach(unit => {
                if (unit && unit.row !== undefined && unit.col !== undefined) {
                    occupiedCells.add(`${unit.row},${unit.col}`);
                }
            });
        });

        // If this cell is within map bounds, is outside the city/wall, and not occupied, it's a valid spot
        if (isInBounds && isOutsideCityAndWall && !occupiedCells.has(`${r},${c}`)) {
            return { row: r, col: c };
        }

        // Add valid neighbors to the queue for next iteration
        for (const dir of directions) {
            const newR = r + dir.dr;
            const newC = c + dir.dc;
            const key = `${newR},${newC}`;

            // Only add neighbors that are within map bounds and haven't been visited
            if (!visited.has(key) && newR >= 0 && newR < cityGridSize && newC >= 0 && newC < cityGridSize) {
                visited.add(key);
                queue.push({r: newR, c: newC});
            }
        }
    }

    return null; // No available position found within the map that meets criteria
}


function _finishRecruitingUnit(completedQueueItem, buildingName, indexInQueue) {
    const unitObject = completedQueueItem.unitObject;
    if (unitObject) {
        // Find a place for the soldier to stand using the new BFS logic
        const position = _findAvailableStagingPosition();
        if (position) {
            unitObject.row = position.row;
            unitObject.col = position.col;
            moduleState._showMessage(`『${unitObject.name}』已完成招募並部署在地圖上！`, 'success');
        } else {
            moduleState._showMessage(`『${unitObject.name}』已完成招募，但城外已無空間部署！`, 'error');
        }
        
        unitObject.inRecruitment = false;
        delete unitObject.recruitingBuilding;
    }

    const currentCity = moduleState._getCurrentCityData();
    const currentBuildingQueue = currentCity.preTrainingQueue[buildingName];
    if (currentBuildingQueue) {
        currentBuildingQueue.splice(indexInQueue, 1);
    }
}

export function getRecruitmentQueues() {
    let allQueuedUnits = [];
    const currentCity = moduleState._getCurrentCityData();
    if (!currentCity || !currentCity.preTrainingQueue) return [];
    
    const allRecruitmentQueues = currentCity.preTrainingQueue;

    for (const buildingName in allRecruitmentQueues) {
        if (Object.hasOwnProperty.call(allRecruitmentQueues, buildingName) && Array.isArray(allRecruitmentQueues[buildingName])) {
            allQueuedUnits = allQueuedUnits.concat(allRecruitmentQueues[buildingName]);
        }
    }
    return allQueuedUnits;
}

function _formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function _generateNextTeamName() {
    const currentCity = moduleState._getCurrentCityData();
    const currentTeams = currentCity.teams;
    let num = 1;
    while (currentTeams.some(team => team.name === `隊伍${num}`)) {
        num++;
    }
    return `隊伍${num}`;
}
