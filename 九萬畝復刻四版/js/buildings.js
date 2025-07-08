// buildings.js
// This module handles all building-related logic, including unit training and troop management.

// --- Module State Variables (private to this module, encapsulated in moduleState) ---
let moduleState = {
    isPlacing: false,         // Is the player currently in placement mode?
    placementPreview: null,   // Holds all data for the placement preview
    selectedBuilding: null,
    repositioningBuilding: null,
    isDraggingPreview: false, // NEW: State to track if the preview is being dragged

    // _teams will now be accessed via a callback to main.js's current city data
    _allSoldiersData: [], // Reference to all soldier data from main.js, passed to recruit.js
};

// --- Shared References from main.js (passed during init) --
let showMessage; 
let updateAnalysisCharts;
let gameViewport;
let cityGridSize; 
let cameraHeightInCells;
let getBuildingCountMain; 
let setCameraLock;
let centerCamera;
let getCurrentMapTranslation;
let _getCurrentMapData;
let _getCurrentMapType;
let drawMap; // Reference to the main drawMap function

// --- DOM Element References ---
let buildModalOverlay, buildModalContent, modalCloseButton, buildingListContainer;

// --- DOM Elements for Troop List (remains in buildings.js as it's a "general" troop overview) ---
let troopListModalOverlay, troopListModalContent, troopModalCloseButton, troopListContainer, noTroopsMessageElement;

// --- Dynamically imported module references ---
let recruitModule = null; 

const defaultBuildingColor = "#FBC02D";
const buildingsData = [
    { name: "主城", cost: "糧食:0 木頭:0 石頭:0", imageUrl: "https://placehold.co/64x64/A9A9A9/FFFFFF?text=主城", color: "#BDBDBD", buildLimit: 1 },
    { name: "兵營", cost: "糧食:0 木頭:0 石頭:0", imageUrl: "https://placehold.co/64x64/E0E0E0/888888?text=兵營", color: defaultBuildingColor, buildLimit: 1 },
    { name: "研究所", cost: "糧食:50 木頭:30 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=研究所`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "鐵匠鋪", cost: "糧食:40 木頭:60 石頭:20", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=鐵匠鋪`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "馬廄", cost: "糧食:30 木頭:50 石頭:0", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=馬廄`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "工廠", cost: "糧食:70 木頭:70 石頭:50", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=工廠`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "校場", cost: "糧食:20 木頭:40 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=校場`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "倉庫", cost: "糧食:10 木頭:20 石頭:5", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=倉庫`, color: defaultBuildingColor, buildLimit: 5 },
    { name: "糧倉", cost: "糧食:15 木頭:10 石頭:5", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=糧倉`, color: defaultBuildingColor, buildLimit: 5 },
    { name: "市場", cost: "糧食:30 木頭:30 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=市場`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "大使館", cost: "糧食:80 木頭:80 石頭:30", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=大使館`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "裡亭屬", cost: "糧食:25 木頭:25 石頭:0", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=裡亭屬`, color: defaultBuildingColor, buildLimit: 1 },
    { name: "邊塞營", cost: "糧食:50 木頭:40 石頭:15", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=邊塞營`, color: defaultBuildingColor, buildLimit: 1 }
];


export async function init(mainShowMessage, mainUpdateAnalysisCharts, mainGameViewport, mainMapContainer,
    mainCityGridSize, mainCameraHeightInCells,
    mainHandlePlacedBuildingPointerDown, mainGetBuildingCount, mainSetCameraLock, mainCenterCamera, mainGetCurrentMapTranslation,
    getCurrentMapDataCallback, getCurrentMapTypeCallback,
    mainAllSoldiersData, mainDrawMap) {

    showMessage = mainShowMessage;
    updateAnalysisCharts = mainUpdateAnalysisCharts;
    gameViewport = mainGameViewport;
    cityGridSize = mainCityGridSize;
    cameraHeightInCells = mainCameraHeightInCells;
    getBuildingCountMain = mainGetBuildingCount;
    setCameraLock = mainSetCameraLock;
    centerCamera = mainCenterCamera;
    getCurrentMapTranslation = mainGetCurrentMapTranslation;
    _getCurrentMapData = getCurrentMapDataCallback;
    _getCurrentMapType = getCurrentMapTypeCallback;
    moduleState._allSoldiersData = mainAllSoldiersData;
    drawMap = mainDrawMap; 

    buildModalOverlay = document.getElementById('build-modal-overlay');
    buildModalContent = document.getElementById('build-modal-content');
    modalCloseButton = document.getElementById('modal-close-button');
    buildingListContainer = document.getElementById('building-list');
    
    troopListModalOverlay = document.getElementById('troop-list-modal-overlay');
    troopListModalContent = document.getElementById('troop-list-modal-content');
    troopModalCloseButton = document.getElementById('troop-modal-close-button');
    troopListContainer = document.getElementById('troop-list-container');
    noTroopsMessageElement = document.getElementById('no-troops-message');

    try {
        recruitModule = await import('./recruit.js');
        recruitModule.initRecruit({
            getCurrentCityData: _getCurrentMapData, 
            allSoldiersData: moduleState._allSoldiersData,
            showMessage: showMessage,
            updateAnalysisCharts: updateAnalysisCharts,
            unitTrainingModalOverlay: document.getElementById('unit-training-modal-overlay'),
            unitTrainingModalContent: document.getElementById('unit-training-modal-content'),
            unitModalCloseButton: document.getElementById('unit-modal-close-button'),
            unitSelectionListContainer: document.getElementById('unit-selection-list'),
            unitSelectionPlaceholder: document.getElementById('unit-selection-placeholder'),
            unitItemContainerWrapper: document.getElementById('unit-item-container-wrapper'),
            unitImage: document.getElementById('unit-image'),
            unitSecondaryImage: document.getElementById('unit-secondary-image'),
            unitName: document.getElementById('unit-name'),
            unitTrainingTime: document.getElementById('unit-training-time'),
            unitSpeed: document.getElementById('unit-speed'),
            unitMovementSpeed: document.getElementById('unit-movement-speed'),
            unitResourcesDisplayValue: document.getElementById('unit-resources-display-value'),
            trainUnitButton: document.getElementById('train-unit-button'),
            preTrainingSlotsContainer: document.getElementById('pre-training-slots'),
            preTrainingSubSlotsContainer: document.getElementById('pre-training-sub-slots'),
            speedDownButton: document.getElementById('speed-down-button'),
            speedUpButton: document.getElementById('speed-up-button'),
            createTeamConfirmModalOverlay: document.getElementById('create-team-confirm-modal-overlay'),
            createTeamMessage: document.getElementById('create-team-message'),
            cancelCreateTeamButton: document.getElementById('cancel-create-team-button'),
            confirmCreateTeamButton: document.getElementById('confirm-create-team-button')
        });
    } catch (error) {
        console.error("Failed to load recruit module:", error);
        showMessage("無法載入招募功能，請稍後再試。", "error");
    }

    buildModalOverlay.addEventListener('click', (e) => e.target === buildModalOverlay && hideBuildModal());
    modalCloseButton.addEventListener('click', hideBuildModal);

    troopListModalOverlay.addEventListener('click', (e) => e.target === troopListModalOverlay && hideTroopListModal());
    troopModalCloseButton.addEventListener('click', hideTroopListModal);
}

// --- NEW/MODIFIED Functions for Canvas-based placement ---

export function isPlacingBuilding() {
    return moduleState.isPlacing;
}

export function getPlacementPreview() {
    return moduleState.placementPreview;
}

// [新功能] 檢查玩家是否正在拖動建築預覽
export function isPreviewBeingDragged() {
    return moduleState.isDraggingPreview;
}

// [新功能] 設定狀態為開始拖動
export function startDraggingPreview() {
    if (moduleState.isPlacing) {
        moduleState.isDraggingPreview = true;
    }
}

// [新功能] 設定狀態為停止拖動
export function stopDraggingPreview() {
    moduleState.isDraggingPreview = false;
}

// [新功能] 檢查點擊座標是否在建築預覽上
export function isPointerOnPreview(canvasX, canvasY, virtualCellSize) {
    if (!moduleState.isPlacing || !moduleState.placementPreview) return false;

    const { row, col } = moduleState.placementPreview;
    const buildingSize = virtualCellSize * 0.85; 
    const offset = (virtualCellSize - buildingSize) / 2;

    const previewX = col * virtualCellSize + offset;
    const previewY = row * virtualCellSize + offset;

    return (
        canvasX >= previewX &&
        canvasX <= previewX + buildingSize &&
        canvasY >= previewY &&
        canvasY <= previewY + buildingSize
    );
}

// [新功能] 直接設定預覽位置 (用於點擊移動)
export function setPreviewPosition(row, col) {
    if (!moduleState.isPlacing || !moduleState.placementPreview) return;

    const currentCity = _getCurrentMapData();
    const isInMainCity = (row >= currentCity.MAIN_CITY_MIN_ROW && row <= currentCity.MAIN_CITY_MAX_ROW &&
                          col >= currentCity.MAIN_CITY_MIN_COL && col <= currentCity.MAIN_CITY_MAX_COL);
    const isOccupied = currentCity.placedBuildings.some(b => b.row === row && b.col === col);

    moduleState.placementPreview.row = row;
    moduleState.placementPreview.col = col;
    moduleState.placementPreview.isValid = isInMainCity && !isOccupied;

    drawMap(); // 重新繪製地圖以更新預覽位置
}


export function handleBuildingPlacementMove(e) {
    if (!moduleState.isPlacing) return;

    const { x: mapTx, y: mapTy } = getCurrentMapTranslation();
    const rect = gameViewport.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;

    const col = Math.floor((pointerX - mapTx) / virtualCellSize);
    const row = Math.floor((pointerY - mapTy) / virtualCellSize);

    if (row === moduleState.placementPreview.row && col === moduleState.placementPreview.col) {
        return; // No change in cell, no need to update
    }

    setPreviewPosition(row, col); // 使用新的函式來更新位置和有效性
}

export function checkPlacementButtonClick(canvasX, canvasY) {
    if (!moduleState.isPlacing || !moduleState.placementPreview) return null;

    const { confirmBtn, cancelBtn, iconSize } = moduleState.placementPreview;
    const radius = iconSize / 2;

    const distConfirm = Math.sqrt((canvasX - confirmBtn.x) ** 2 + (canvasY - confirmBtn.y) ** 2);
    if (distConfirm <= radius) {
        return 'confirm';
    }

    const distCancel = Math.sqrt((canvasX - cancelBtn.x) ** 2 + (canvasY - cancelBtn.y) ** 2);
    if (distCancel <= radius) {
        return 'cancel';
    }

    return null;
}


function handleCancelPlacement() {
    if (moduleState.repositioningBuilding) {
        const currentCity = _getCurrentMapData();
        currentCity.placedBuildings.push(moduleState.repositioningBuilding);
    }
    resetPlacementState();
    drawMap();
}

function handleConfirmPlacement() {
    if (!moduleState.isPlacing || !moduleState.placementPreview) return;

    if (!moduleState.placementPreview.isValid) {
        showMessage('無法在此位置建造建築物！', 'error');
        return;
    }
    
    const targetRow = moduleState.placementPreview.row;
    const targetCol = moduleState.placementPreview.col;
    const currentCity = _getCurrentMapData();

    if (moduleState.repositioningBuilding) {
        moduleState.repositioningBuilding.row = targetRow;
        moduleState.repositioningBuilding.col = targetCol;
        currentCity.placedBuildings.push(moduleState.repositioningBuilding);
    } else if (moduleState.selectedBuilding) {
        const buildingToPlace = moduleState.selectedBuilding;
        const currentCount = getBuildingCountMain(buildingToPlace.name);
        const buildLimit = buildingToPlace.buildLimit || 1;

        if (currentCount >= buildLimit) {
            showMessage(`${buildingToPlace.name} 已達建造上限！`, 'error');
            resetPlacementState();
            drawMap();
            return;
        }

        const newBuildingData = { 
            name: buildingToPlace.name, 
            row: targetRow, 
            col: targetCol 
        };
        currentCity.placedBuildings.push(newBuildingData);
    }
    
    resetPlacementState();
    updateAnalysisCharts();
    drawMap();
}

function resetPlacementState() {
    moduleState.isPlacing = false;
    moduleState.placementPreview = null;
    moduleState.selectedBuilding = null;
    moduleState.repositioningBuilding = null;
    moduleState.isDraggingPreview = false; // 確保重置拖動狀態
    if (setCameraLock) {
        setCameraLock(false);
    }
}


function handleSelectBuilding(building) {
    if (_getCurrentMapType() === 'worldMap') {
        showMessage("無法在主世界地圖上選擇建築物進行放置。", "error");
        return;
    }

    hideBuildModal();

    const currentCity = _getCurrentMapData();
    let availableSpots = [];
    for (let r = currentCity.MAIN_CITY_MIN_ROW; r <= currentCity.MAIN_CITY_MAX_ROW; r++) {
        for (let c = currentCity.MAIN_CITY_MIN_COL; c <= currentCity.MAIN_CITY_MAX_COL; c++) {
            if (!currentCity.placedBuildings.some(pb => pb.row === r && pb.col === c)) {
                availableSpots.push({ row: r, col: c });
            }
        }
    }

    if (availableSpots.length === 0) {
        showMessage('主城區內沒有足夠空間建造此建築物！', 'error');
        return;
    }
    
    const initialSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
    
    moduleState.selectedBuilding = building;
    moduleState.repositioningBuilding = null;
    startPlacementMode(building, initialSpot.row, initialSpot.col);
}

export function startRepositioning(buildingToReposition) {
    if (_getCurrentMapType() === 'worldMap') {
        showMessage("無法在主世界地圖上重新放置建築物。", "error");
        return;
    }

    moduleState.repositioningBuilding = buildingToReposition;
    moduleState.selectedBuilding = null;
    
    const currentCity = _getCurrentMapData();
    currentCity.placedBuildings = currentCity.placedBuildings.filter(b => b !== buildingToReposition);

    startPlacementMode(buildingToReposition, buildingToReposition.row, buildingToReposition.col);
}

function startPlacementMode(building, initialRow, initialCol) {
    if (setCameraLock) setCameraLock(true);
    if (centerCamera) centerCamera(initialRow, initialCol, _getCurrentMapType());

    moduleState.isPlacing = true;
    moduleState.placementPreview = {
        name: building.name,
        color: buildingsData.find(b => b.name === building.name)?.color || defaultBuildingColor,
        row: initialRow,
        col: initialCol,
        isValid: true,
        confirmBtn: { x: 0, y: 0 }, 
        cancelBtn: { x: 0, y: 0 },
    };
    
    drawMap();
}

// --- Unchanged or Minor Change Functions ---

export function isBuildModalVisible() { return !buildModalOverlay.classList.contains('hidden'); }
export function isUnitTrainingModalVisible() { return recruitModule ? recruitModule.isRecruitModalVisible() : false; }
export function isTroopListModalVisible() { return !troopListModalOverlay.classList.contains('hidden'); }
export function isCreateTeamConfirmModalVisible() { return recruitModule ? recruitModule.isCreateTeamConfirmModalVisible() : false; }

export function getTeams() {
    if (_getCurrentMapType() === 'worldMap') return [];
    const currentMap = _getCurrentMapData();
    return currentMap && Array.isArray(currentMap.teams) ? currentMap.teams : [];
}

export function getPreTrainingQueue() {
    if (_getCurrentMapType() === 'worldMap') return [];
    return recruitModule ? recruitModule.getRecruitmentQueues() : [];
}

export { handleConfirmPlacement, handleCancelPlacement };

export function showBuildModal() {
    if (_getCurrentMapType() === 'worldMap') {
        showMessage("無法在主世界地圖上建造建築物。", "error");
        return;
    }
    populateBuildingList();
    buildModalOverlay.classList.remove('hidden');
}

function hideBuildModal() {
    buildModalOverlay.classList.add('hidden');
}

function populateBuildingList() {
    buildingListContainer.innerHTML = '';
    buildingsData.forEach(building => {
        const currentCount = getBuildingCountMain(building.name);
        const buildLimit = building.buildLimit || 1;
        const buildingItem = document.createElement('div');
        buildingItem.className = 'flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg shadow-sm transition-colors duration-150';

        let statusText, selectButtonHtml;
        if (currentCount >= buildLimit) {
            buildingItem.classList.add('opacity-50', 'pointer-events-none');
            statusText = `<span class="font-medium text-red-700">已達上限 (${currentCount}/${buildLimit})</span>`;
            selectButtonHtml = `<button class="select-building-button btn-custom-base btn-small-size bg-gray-400 text-white cursor-not-allowed" disabled>上限</button>`;
        } else {
            buildingItem.classList.add('hover:bg-gray-200');
            statusText = `<span class="font-medium text-blue-700">可建造: ${buildLimit - currentCount} (${currentCount}/${buildLimit})</span>`;
            selectButtonHtml = `<button class="select-building-button btn-custom-base btn-custom-normal btn-small-size flex-shrink-0">選擇</button>`;
        }

        buildingItem.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${building.imageUrl}" alt="${building.name}圖像" class="w-16 h-16 object-cover rounded-md border border-gray-300 mb-2">
                <div class="font-semibold text-lg text-gray-800">${building.name}</div>
                <div class="text-gray-600 text-sm">資源消耗: <span class="font-medium text-blue-700">${building.cost}</span></div>
                <div class="text-gray-600 text-sm">${statusText}</div>
            </div>
            ${selectButtonHtml}`;

        const selectButton = buildingItem.querySelector('.select-building-button:not([disabled])');
        if (selectButton) {
            selectButton.addEventListener('click', () => handleSelectBuilding(building));
        }
        buildingListContainer.appendChild(buildingItem);
    });
}

export function getBuildingDataByName(name) {
    return buildingsData.find(b => b.name === name);
}

export function showUnitTrainingModal(buildingData) {
    if (_getCurrentMapType() === 'worldMap') {
        showMessage("請先進入城市進行單位招募。", "error");
        return;
    }
    if (recruitModule) {
        recruitModule.showRecruitModal(buildingData);
    } else {
        showMessage("招募模組尚未載入，請稍後再試。", "error");
    }
}

export function showTroopListModal() {
    if (_getCurrentMapType() === 'worldMap') {
        showMessage("請先進入城市查看部隊。", "error");
        return;
    }
    _populateTroopList();
    troopListModalOverlay.classList.remove('hidden');
}

function hideTroopListModal() {
    troopListModalOverlay.classList.add('hidden');
}

const DEFAULT_MIN_SPEED_MAP = 25; 
const TEAM_NAME_MAX_LENGTH = 5; 

function _calculateTeamMovementSpeed(units) {
    if (!units || units.length === 0) {
        return DEFAULT_MIN_SPEED_MAP;
    }

    let minSpeed = Infinity;
    let hasValidUnit = false;

    units.forEach(unit => {
        if (unit && unit.movementSpeed !== undefined && unit.movementSpeed !== null) {
            minSpeed = Math.min(minSpeed, unit.movementSpeed);
            hasValidUnit = true;
        }
    });

    return hasValidUnit ? Math.max(DEFAULT_MIN_SPEED_MAP, minSpeed) : DEFAULT_MIN_SPEED_MAP;
}


function _populateTroopList() {
    troopListContainer.innerHTML = '';
    const currentCity = _getCurrentMapData();
    const currentTeams = Array.isArray(currentCity.teams) ? currentCity.teams : [];

    const totalUnits = currentTeams.reduce((acc, team) => acc + (Array.isArray(team.units) ? team.units.filter(u => u).length : 0), 0);
    const totalUnitsInRecruitment = getPreTrainingQueue().length;

    if (totalUnits === 0 && totalUnitsInRecruitment === 0) {
        troopListContainer.appendChild(noTroopsMessageElement);
        noTroopsMessageElement.classList.remove('hidden');
    } else {
        if (noTroopsMessageElement.parentNode) {
            noTroopsMessageElement.classList.add('hidden');
        }
        currentTeams.forEach((team, teamIndex) => {
            const teamBlock = document.createElement('div');
            teamBlock.className = 'team-block mb-5 p-3 bg-gray-100 rounded-lg shadow-sm';
            
            const teamMovementSpeedCalculated = _calculateTeamMovementSpeed(team.units);

            const displayedMovementSpeed = team.customMovementSpeed !== undefined ? 
                                           team.customMovementSpeed : 
                                           teamMovementSpeedCalculated;

            const unitsHtml = Array.isArray(team.units) ? team.units.map((_, i) => {
                const unit = team.units[i];
                if (unit) {
                    return `<div class="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md relative overflow-hidden" title="${unit.name}${unit.inRecruitment ? ' (招募中)' : ''}">
                                <div class="absolute w-4/5 h-4/5 rounded-sm flex items-center justify-center text-white text-xs font-bold" style="background-color: hsl(120, 100%, 12%); ${unit.inRecruitment ? 'opacity:0.3;' : ''} overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${unit.name.substring(0, 1)}</div>
                            </div>`;
                }
                return '<div class="w-12 h-12 bg-gray-200 border border-gray-300 rounded-md"></div>';
            }).join('') : Array(9).fill('<div class="w-12 h-12 bg-gray-200 border border-gray-300 rounded-md"></div>').join('');

            teamBlock.innerHTML = `
                <div class="flex items-center justify-between mb-3 flex-wrap">
                    <h3 class="font-semibold text-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white px-2 py-1 rounded-md cursor-text inline-block min-w-[100px] team-name-editable" contenteditable="true" data-team-index="${teamIndex}">${team.name}</h3>
                    <div class="flex items-center text-gray-600 text-sm">
                        移動速度(主地圖): 
                        <button class="speed-down-button px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 active:scale-95 transition-all duration-100 flex items-center justify-center font-bold" data-team-index="${teamIndex}" aria-label="Decrease speed">-</button>
                        <span class="font-medium text-blue-700 mx-1 w-10 text-center cursor-pointer hover:underline team-speed-editable" 
                            contenteditable="true" 
                            data-team-index="${teamIndex}" 
                            data-min-unit-speed="${teamMovementSpeedCalculated}"
                            data-default-min-speed="${DEFAULT_MIN_SPEED_MAP}">
                            ${displayedMovementSpeed}
                        </span>
                        <button class="speed-up-button px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 active:scale-95 transition-all duration-100 flex items-center justify-center font-bold" data-team-index="${teamIndex}" aria-label="Increase speed">+</button>
                        / 小時
                    </div>
                </div>
                <div class="grid grid-cols-9 gap-1">
                    ${unitsHtml}
                </div>`;
            
            const teamNameH3 = teamBlock.querySelector(`h3[data-team-index="${teamIndex}"]`);
            teamNameH3.addEventListener('blur', (e) => {
                const newName = e.target.innerText.trim();
                const truncatedName = newName.length > TEAM_NAME_MAX_LENGTH ? newName.substring(0, TEAM_NAME_MAX_LENGTH) : newName;
                currentTeams[teamIndex].name = truncatedName || currentTeams[teamIndex].name;
                e.target.innerText = currentTeams[teamIndex].name;
                if (newName.length > TEAM_NAME_MAX_LENGTH) {
                    showMessage(`隊伍名稱已自動截斷為 ${TEAM_NAME_MAX_LENGTH} 個字。`, 'error');
                }
            });
            teamNameH3.addEventListener('input', (e) => {
                let text = e.target.innerText;
                if (text.length > TEAM_NAME_MAX_LENGTH) {
                    e.target.innerText = text.substring(0, TEAM_NAME_MAX_LENGTH);
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(e.target);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });


            const speedSpan = teamBlock.querySelector(`.team-speed-editable[data-team-index="${teamIndex}"]`);
            if (speedSpan) {
                speedSpan.addEventListener('blur', (e) => {
                    _handleTeamMovementSpeedEdit(e, teamIndex);
                });
                speedSpan.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                        e.target.blur();
                    }
                });
                speedSpan.addEventListener('input', (e) => {
                    let text = e.target.innerText;
                    text = text.replace(/[^0-9.]/g, '');
                    e.target.innerText = text;
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(e.target);
                    range.collapse(false); 
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            }

            const speedDownButton = teamBlock.querySelector(`.speed-down-button[data-team-index="${teamIndex}"]`);
            const speedUpButton = teamBlock.querySelector(`.speed-up-button[data-team-index="${teamIndex}"]`);
            if (speedDownButton) {
                speedDownButton.addEventListener('click', () => _adjustTeamMovementSpeed(teamIndex, -1));
            }
            if (speedUpButton) {
                speedUpButton.addEventListener('click', () => _adjustTeamMovementSpeed(teamIndex, 1));
            }

            troopListContainer.appendChild(teamBlock);
        });
    }
}

function _handleTeamMovementSpeedEdit(event, teamIndex) {
    const span = event.target;
    const currentCity = _getCurrentMapData();
    const currentTeam = currentCity.teams[teamIndex];
    const minUnitSpeed = parseFloat(span.dataset.minUnitSpeed);
    const defaultMinSpeed = parseFloat(span.dataset.defaultMinSpeed);
    
    let rawValue = span.innerText.trim();
    let newValue = parseFloat(rawValue);

    if (rawValue === '' || isNaN(newValue)) {
        showMessage('移動速度必須為數字！已恢復原值。', 'error');
        const originalSpeed = currentTeam.customMovementSpeed !== undefined ? currentTeam.customMovementSpeed : minUnitSpeed;
        span.innerText = originalSpeed; 
        currentTeam.customMovementSpeed = originalSpeed;
        return;
    }

    newValue = Math.max(defaultMinSpeed, newValue);
    newValue = Math.min(minUnitSpeed, newValue);

    currentTeam.customMovementSpeed = newValue;
    span.innerText = newValue;
    showMessage(`隊伍『${currentTeam.name}』的移動速度已更新為 ${newValue} / 小時。`, 'success');
}

function _adjustTeamMovementSpeed(teamIndex, delta) {
    const currentCity = _getCurrentMapData();
    const currentTeam = currentCity.teams[teamIndex];
    const speedSpan = troopListContainer.querySelector(`.team-speed-editable[data-team-index="${teamIndex}"]`);

    if (!speedSpan) return;

    const minUnitSpeed = parseFloat(speedSpan.dataset.minUnitSpeed);
    const defaultMinSpeed = parseFloat(speedSpan.dataset.defaultMinSpeed);
    
    let currentSpeed = parseFloat(speedSpan.innerText);
    if (isNaN(currentSpeed)) {
        currentSpeed = currentTeam.customMovementSpeed !== undefined ? currentTeam.customMovementSpeed : minUnitSpeed;
    }

    let newSpeed = currentSpeed + delta;

    newSpeed = Math.max(defaultMinSpeed, newSpeed);
    newSpeed = Math.min(minUnitSpeed, newSpeed);

    currentTeam.customMovementSpeed = newSpeed;
    speedSpan.innerText = newSpeed;
    showMessage(`隊伍『${currentTeam.name}』的移動速度已調整為 ${newSpeed} / 小時。`, 'success');
}
