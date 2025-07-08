// src/game/buildings.js
// 職責：管理所有與建築相關的邏輯，包括 UI 互動和放置流程。
// [重構] 修改為招募功能的"宿主"，並委派渲染任務給 recruitModule。

import { buildingsData, getBuildingDataByName } from './buildingData.js';
import { recruitModule } from './recruit.js'; // 確保 recruitModule 被引入

export const buildingsModule = (() => {
    // --- 內部狀態 ---
    let isInitialized = false;
    let isPlacing = false;
    let placementPreview = null;
    let repositioningBuilding = null;
    let currentBuildingInModal = null;
    let currentActiveTab = 'info';
    
    // --- 外部模組的參考 ---
    let mapManager;
    let showMessage;
    let getCurrentCity;
    let onBuildingPlaced;

    // --- DOM 元素 ---
    let buildModalOverlay, modalCloseButton, buildingListContainer;
    let buildingInfoModalOverlay, buildingInfoModalCloseButton, buildingInfoModalBody;
    let tabBuildingInfo, tabFunction;


    function init(dependencies) {
        if (isInitialized) return;

        mapManager = dependencies.mapManager;
        showMessage = dependencies.showMessage;
        getCurrentCity = dependencies.getCurrentCity;
        onBuildingPlaced = dependencies.onBuildingPlaced;
        // recruitModule 的依賴在 main.js 中傳遞

        buildModalOverlay = document.getElementById('build-modal-overlay');
        modalCloseButton = document.getElementById('modal-close-button');
        buildingListContainer = document.getElementById('building-list');
        
        buildingInfoModalOverlay = document.getElementById('building-info-modal-overlay');
        buildingInfoModalCloseButton = document.getElementById('building-info-modal-close-button');
        buildingInfoModalBody = document.getElementById('building-info-modal-body');
        
        tabBuildingInfo = document.getElementById('tab-building-info');
        tabFunction = document.getElementById('tab-function');

        // 綁定事件監聽器
        buildModalOverlay.addEventListener('click', (e) => e.target === buildModalOverlay && hideBuildModal());
        modalCloseButton.addEventListener('click', hideBuildModal);
        buildingInfoModalOverlay.addEventListener('click', (e) => e.target === buildingInfoModalOverlay && hideBuildingInfoModal());
        buildingInfoModalCloseButton.addEventListener('click', hideBuildingInfoModal);

        if (tabBuildingInfo) tabBuildingInfo.addEventListener('click', () => showBuildingInfoModal(currentBuildingInModal, 'info'));
        if (tabFunction) tabFunction.addEventListener('click', () => showBuildingInfoModal(currentBuildingInModal, 'function'));

        isInitialized = true;
        console.log("Buildings Module initialized (Refactored).");
    }

    function showBuildModal() {
        if (isPlacing) {
            showMessage("請先完成或取消當前建築的放置操作。", "error");
            return;
        }
        populateBuildingList();
        buildModalOverlay.classList.remove('hidden');
    }

    function hideBuildModal() {
        buildModalOverlay.classList.add('hidden');
    }

    function populateBuildingList() {
        const currentCity = getCurrentCity();
        if (!currentCity) return;
        
        buildingListContainer.innerHTML = '';
        buildingsData.forEach(building => {
            const currentCount = currentCity.placedBuildings.filter(b => b.name === building.name).length;
            const buildLimit = building.buildLimit || 1;
            const canBuild = currentCount < buildLimit;

            const buildingItem = document.createElement('div');
            buildingItem.className = `flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg shadow-sm transition-colors duration-150 ${canBuild ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-50'}`;
            
            buildingItem.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${building.imageUrl}" alt="${building.name}圖像" class="w-16 h-16 object-cover rounded-md border border-gray-300">
                    <div>
                        <div class="font-semibold text-lg text-gray-800">${building.name}</div>
                        <div class="text-xs text-gray-500">${building.description}</div>
                        <div class="text-sm text-gray-600 mt-1">數量: ${currentCount}/${buildLimit}</div>
                    </div>
                </div>
                <button class="select-building-button btn-custom-base btn-custom-normal btn-small-size flex-shrink-0" ${!canBuild ? 'disabled' : ''}>
                    ${canBuild ? '建造' : '已達上限'}
                </button>
            `;

            if (canBuild) {
                buildingItem.querySelector('.select-building-button').addEventListener('click', () => {
                    handleSelectBuilding(building);
                });
            }
            buildingListContainer.appendChild(buildingItem);
        });
    }

    function handleSelectBuilding(building) {
        hideBuildModal();
        startPlacement(building, false);
    }
    
    function handleBuildingClick(building) {
        showBuildingInfoModal(building, 'info'); 
    }

    function startPlacement(buildingData, isRepositioning = false, originalBuilding = null) {
        if (isPlacing) {
            showMessage("請先完成或取消當前建築的放置操作。", "error");
            return;
        }
        isPlacing = true;
        repositioningBuilding = isRepositioning ? originalBuilding : null;
        mapManager.setRepositioningBuilding(repositioningBuilding);
        const currentCity = getCurrentCity();
        let initialPreviewPos = isRepositioning ? { row: originalBuilding.row, col: originalBuilding.col } : (findAvailableSpot(currentCity) || { row: 8, col: 8 });
        placementPreview = { name: buildingData.name, row: initialPreviewPos.row, col: initialPreviewPos.col, isValid: true };
        mapManager.setPlacementPreview(placementPreview);
        mapManager.setCameraLock(true);
        const centerRow = (currentCity.MAIN_CITY_MIN_ROW + currentCity.MAIN_CITY_MAX_ROW) / 2;
        const centerCol = (currentCity.MAIN_CITY_MIN_COL + currentCity.MAIN_CITY_MAX_COL) / 2;
        mapManager.centerOn(centerRow, centerCol); 
        showMessage(`正在${isRepositioning ? '重新放置' : '放置'} ${buildingData.name}。請點擊新的位置或按 ESC 取消。`, 'info');
        mapManager.hideTileInteractionOverlay();
    }
    
    function findAvailableSpot(city) {
        for (let r = city.MAIN_CITY_MIN_ROW; r <= city.MAIN_CITY_MAX_ROW; r++) {
            for (let c = city.MAIN_CITY_MIN_COL; c <= city.MAIN_CITY_MAX_COL; c++) {
                const isOccupied = city.placedBuildings.some(b => 
                    b.row === r && b.col === c && 
                    !(repositioningBuilding && b.row === repositioningBuilding.row && b.col === repositioningBuilding.col)
                );
                if (!isOccupied) return { row: r, col: c };
            }
        }
        return null;
    }

    function confirmPlacement() {
        if (!isPlacing || !placementPreview || !placementPreview.isValid) return;
        const newBuilding = {
            name: placementPreview.name,
            row: placementPreview.row,
            col: placementPreview.col,
            level: repositioningBuilding ? repositioningBuilding.level : 1
        };
        onBuildingPlaced(newBuilding, repositioningBuilding);
        showMessage(`已成功${repositioningBuilding ? '重新放置' : '放置'} ${newBuilding.name}！`, "success");
        cancelPlacement();
    }

    function cancelPlacement() {
        if (!isPlacing) return;
        isPlacing = false;
        placementPreview = null;
        repositioningBuilding = null;
        mapManager.setRepositioningBuilding(null);
        mapManager.setPlacementPreview(null);
        mapManager.setCameraLock(false);
        showMessage("已取消放置操作。", 'info');
    }

    /**
     * [重構核心] 顯示建築資訊模態框，並根據建築類型決定是否顯示功能分頁。
     * @param {object} building - 要顯示資訊的建築物物件。
     * @param {string} activeTab - 當前活躍的分頁 ('info' 或 'function')。
     */
    function showBuildingInfoModal(building, activeTab = 'info') {
        currentBuildingInModal = building;
        currentActiveTab = activeTab;
        const buildingStaticData = getBuildingDataByName(building.name);
        
        const updateTabStyles = (tabElement, isActive) => {
            if (!tabElement) return;
            const activeClasses = ['bg-white', 'text-gray-800', 'border-x', 'border-t', 'border-gray-300', '-mb-px'];
            const inactiveClasses = ['bg-blue-600', 'hover:bg-blue-700', 'text-white', 'shadow-md'];
            if (isActive) {
                tabElement.classList.add(...activeClasses);
                tabElement.classList.remove(...inactiveClasses);
                tabElement.disabled = true;
            } else {
                tabElement.classList.remove(...activeClasses);
                tabElement.classList.add(...inactiveClasses);
                tabElement.disabled = false;
            }
        };

        const hasFunctionality = ["兵營", "馬廄", "工廠"].includes(building.name);
        updateTabStyles(tabBuildingInfo, activeTab === 'info');

        if (tabFunction) {
            if (hasFunctionality) {
                tabFunction.classList.remove('hidden');
                updateTabStyles(tabFunction, activeTab === 'function');
                const functionTextMap = { "兵營": "招募士兵", "馬廄": "招募騎兵", "工廠": "建造器械" };
                tabFunction.textContent = functionTextMap[building.name] || '功能';
            } else {
                tabFunction.classList.add('hidden');
            }
        }

        buildingInfoModalBody.innerHTML = '';
        recruitModule.hideRecruitmentContent(); 

        if (activeTab === 'info') {
            buildingInfoModalBody.innerHTML = `
                <div class="flex flex-col items-center justify-center text-gray-800 text-center">
                    <h3 class="text-xl font-bold mb-2">${building.name} (等級 ${building.level || 1})</h3>
                    <img src="${buildingStaticData.imageUrl}" alt="${building.name}圖片" class="w-24 h-24 object-contain mb-4 border border-gray-300 rounded-md">
                    <p class="text-md text-gray-600">${buildingStaticData.description}</p>
                    <div class="mt-4 text-sm text-gray-500">
                        <p>位置: (${building.row}, ${building.col})</p>
                    </div>
                </div>
            `;
        } else if (activeTab === 'function' && hasFunctionality) {
            // 委派渲染任務給 recruitModule
            recruitModule.renderRecruitmentContent(buildingInfoModalBody, building);
        }
        
        buildingInfoModalOverlay.classList.remove('hidden');
    }

    function hideBuildingInfoModal() {
        buildingInfoModalOverlay.classList.add('hidden');
        recruitModule.hideRecruitmentContent(); // 關閉時確保清理招募UI
        currentBuildingInModal = null;
        currentActiveTab = 'info';
    }
    
    return {
        init,
        showBuildModal,
        isPlacing: () => isPlacing,
        confirmPlacement,
        cancelPlacement,
        handleBuildingClick,
        startPlacement
    };
})();
