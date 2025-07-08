// --- 模組引入 ---
let buildingsModule = null;
let soldiersModule = null;
let illustratedGuideModule = null;

// --- 遊戲資料與設定 (更新資源設定) ---
const RESOURCE_PROPERTIES = {
    '糧食': { baseProduction: 10 },
    '木頭': { baseProduction: 8 },
    '石頭': { baseProduction: 5 }
};

const PRODUCTION_RATES_BY_LEVEL = {
    1: 2,
    2: 4,
    3: 6,
    4: 10,
    5: 14
};

const RESOURCE_TYPES = Object.keys(RESOURCE_PROPERTIES);
let allSoldiersData = [];

// --- 狀態變數 ---
let isDragging = false;
let isCameraLocked = false;
let lastPointerX = 0;
let lastPointerY = 0;
let currentMapTranslateX = 0;
let currentMapTranslateY = 0;
let selectedMinimapViewpoint = { row: -1, col: -1 };

let pointerState = { isDown: false, startX: 0, startY: 0, hasMoved: false };
let touchState = { pointers: [], lastDist: 0, lastCenter: null };
let longPressTimer = null; 
const LONG_PRESS_DURATION = 500; 

// --- 地圖互動與狀態 ---
let selectedWorldTile = null; 
let tileInteractionUI = {}; 
let resourceNodeMaps = {}; 
let currentSubMapKey = null; 
let worldMapGrid = []; 

// --- DOM & Canvas 元素引用 ---
let gameViewport, gameMapCanvas, gameMapCtx;
let buildButton, troopsButton, infoButton, backButton, minimapButton;
let messageBox, analysisModalOverlay, analysisModalCloseButton;
let infoModalOverlay, infoModalCloseButton, infoToAnalysisButton;
let infoToIllustratedGuideButton, worldMinimapModalOverlay, worldMinimapCanvas, worldMinimapCtx, worldMinimapCloseButton, confirmMinimapViewButton;
let minimapInputRow, minimapInputCol;
let goBackToCityButton;

// --- 遊戲設定 ---
const cityGridSize = 17;
const worldMapGridSizeX = 60;
const worldMapGridSizeY = 60;
const subMapGridSize = 11;
const worldMapCityRepresentationSize = 2;
const cameraHeightInCells = 9;
const MAX_MOVE_FOR_CLICK = 10;

// --- 地圖管理 ---
let cityMaps = [];
let currentCityIndex = 0;
let currentMapType = 'cityMap'; 

// --- 地圖顏色主題更新 ---
const mapColors = {
    placementValid: 'rgba(251, 191, 36, 0.7)',
    placementInvalid: 'rgba(239, 68, 68, 0.7)',
    selectionHighlight: 'rgba(255, 255, 0, 0.5)',
    soldier: { "槍兵": '#28A745', "騎兵": '#8B4513', "盾兵": '#1E90FF', "弓兵": '#008080', "器械": '#696969' },
    cityPlayer: '#22C55E', // 綠色
    cityEnemy: '#EF4444',  // 紅色
    cityAlly: '#3B82F6',   // 藍色 (盟友)
    cityNeutral: '#A8A29E', // 灰色 (中立)
    minimapBackground: '#F5DEB3', // 米黃色
    outerGrass: '#4CAF50',
    middleEarth: '#8D6E63',
    innerEarth: '#6D4C41',
    worldMapBackground: `rgb(${Math.floor(60 * 0.75)}, ${Math.floor(150 * 0.75)}, ${Math.floor(60 * 0.75)})`, 
};


document.addEventListener('DOMContentLoaded', async () => {
    getDomElements();
    initializeWorldMapGrid();
    initializeCityMaps();

    currentMapType = 'cityMap';
    currentCityIndex = 0;
    setupCanvas();
    await initializeGameData(); // 等待模組初始化
    setupEventListeners(); // 在所有模組都可用後設定監聽器

    const initialCity = cityMaps[currentCityIndex];
    centerCamera(initialCity.mainCityCenterY, initialCity.mainCityCenterX, 'cityMap');

    updateUIVisibility();
    requestAnimationFrame(drawMap);
    
    clearSelectedTile(); 
});

function roundRect(ctx, x, y, width, height, radius = 0) {
    let r = { tl: 0, tr: 0, br: 0, bl: 0 };
    if (typeof radius === 'number') {
        r = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        r = { ...r, ...radius };
    }
    const maxHorizontalRadius = Math.min(width / 2);
    const maxVerticalRadius = Math.min(height / 2);
    r.tl = Math.min(r.tl, maxHorizontalRadius, maxVerticalRadius);
    r.tr = Math.min(r.tr, maxHorizontalRadius, maxVerticalRadius);
    r.br = Math.min(r.br, maxHorizontalRadius, maxVerticalRadius);
    r.bl = Math.min(r.bl, maxHorizontalRadius, maxVerticalRadius);
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
}

function drawWorldMapTiles(ctx) {
    const currentCellSize = gameViewport.clientHeight / cameraHeightInCells;
    const { visibleRowStart, visibleRowEnd, visibleColStart, visibleColEnd } = getVisibleWorldBounds();

    const resourceProps = {
        '石頭': { r: 60, g: 150, b: 60, factor: 1.2, radius: 10, scale: 0.9 },
        '木頭': { r: 150, g: 255, b: 120, factor: 0.6, radius: 10, scale: 0.9 },
        '糧食': { r: 60, g: 150, b: 60, factor: 0.6, radius: 10, scale: 0.9 }
    };
    
    const isSameType = (currentPlotType, nX, nY) => {
        if (nX < 0 || nX >= worldMapGridSizeX || nY < 0 || nY >= worldMapGridSizeY) return false;
        const neighborPlot = worldMapGrid[nY] ? worldMapGrid[nY][nX] : null;
        return neighborPlot && neighborPlot.resourceType === currentPlotType;
    };

    for (let r = Math.max(0, visibleRowStart); r <= Math.min(worldMapGridSizeY - 1, visibleRowEnd); r++) {
        for (let c = Math.max(0, visibleColStart); c <= Math.min(worldMapGridSizeX - 1, visibleColEnd); c++) {
            const plot = worldMapGrid[r] ? worldMapGrid[r][c] : null;

            if (plot && plot.cityDataRef) continue;

            if (plot && resourceProps[plot.resourceType]) {
                const screenPos = convertMapToScreenCoords(r, c);
                const props = resourceProps[plot.resourceType];

                const R = Math.min(255, Math.floor(props.r * props.factor));
                const G = Math.min(255, Math.floor(props.g * props.factor));
                const B = Math.min(255, Math.floor(props.b * props.factor));
                ctx.fillStyle = `rgb(${R}, ${G}, ${B})`;

                const baseOffset = (currentCellSize - (currentCellSize * props.scale)) / 2;
                let drawX = screenPos.x + baseOffset;
                let drawY = screenPos.y + baseOffset;
                let drawWidth = currentCellSize * props.scale;
                let drawHeight = currentCellSize * props.scale;

                const sameTop = isSameType(plot.resourceType, c, r - 1);
                const sameRight = isSameType(plot.resourceType, c + 1, r);
                const sameBottom = isSameType(plot.resourceType, c, r + 1);
                const sameLeft = isSameType(plot.resourceType, c - 1, r);
                
                if (sameLeft) { drawX -= baseOffset; drawWidth += baseOffset; }
                if (sameRight) { drawWidth += baseOffset; }
                if (sameTop) { drawY -= baseOffset; drawHeight += baseOffset; }
                if (sameBottom) { drawHeight += baseOffset; }

                const currentRadii = {
                    tl: (sameTop || sameLeft) ? 0 : props.radius,
                    tr: (sameTop || sameRight) ? 0 : props.radius,
                    br: (sameBottom || sameRight) ? 0 : props.radius,
                    bl: (sameBottom || sameLeft) ? 0 : props.radius
                };
                
                roundRect(ctx, drawX, drawY, drawWidth, drawHeight, currentRadii);
                ctx.fill();

                ctx.fillStyle = mapColors.worldMapBackground;
                const sameTopLeft = isSameType(plot.resourceType, c - 1, r - 1);
                const sameTopRight = isSameType(plot.resourceType, c + 1, r - 1);
                const sameBottomRight = isSameType(plot.resourceType, c + 1, r + 1);
                const sameBottomLeft = isSameType(plot.resourceType, c - 1, r + 1);

                if (sameTop && sameLeft && !sameTopLeft) {
                    ctx.beginPath();
                    ctx.arc(screenPos.x + baseOffset, screenPos.y + baseOffset, props.radius, Math.PI, 1.5 * Math.PI);
                    ctx.lineTo(screenPos.x + baseOffset, screenPos.y + baseOffset);
                    ctx.fill();
                }
                if (sameTop && sameRight && !sameTopRight) {
                    ctx.beginPath();
                    ctx.arc(screenPos.x + currentCellSize - baseOffset, screenPos.y + baseOffset, props.radius, 1.5 * Math.PI, 2 * Math.PI);
                    ctx.lineTo(screenPos.x + currentCellSize - baseOffset, screenPos.y + baseOffset);
                    ctx.fill();
                }
                if (sameBottom && sameRight && !sameBottomRight) {
                    ctx.beginPath();
                    ctx.arc(screenPos.x + currentCellSize - baseOffset, screenPos.y + currentCellSize - baseOffset, props.radius, 0, 0.5 * Math.PI);
                    ctx.lineTo(screenPos.x + currentCellSize - baseOffset, screenPos.y + currentCellSize - baseOffset);
                    ctx.fill();
                }
                if (sameBottom && sameLeft && !sameBottomLeft) {
                    ctx.beginPath();
                    ctx.arc(screenPos.x + baseOffset, screenPos.y + currentCellSize - baseOffset, props.radius, 0.5 * Math.PI, Math.PI);
                    ctx.lineTo(screenPos.x + baseOffset, screenPos.y + currentCellSize - baseOffset);
                    ctx.fill();
                }
            }
        }
    }
}

function drawMap() {
    if (!gameMapCtx) return;

    gameMapCtx.clearRect(0, 0, gameMapCanvas.width, gameMapCanvas.height);
    const { visibleRowStart, visibleRowEnd, visibleColStart, visibleColEnd } = getVisibleWorldBounds();
    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
    
    gameMapCtx.save();
    gameMapCtx.translate(currentMapTranslateX, currentMapTranslateY);

    if (currentMapType === 'worldMap') {
        gameMapCtx.fillStyle = mapColors.worldMapBackground;
        gameMapCtx.fillRect(
            visibleColStart * virtualCellSize - virtualCellSize, 
            visibleRowStart * virtualCellSize - virtualCellSize, 
            (visibleColEnd - visibleColStart + 2) * virtualCellSize, 
            (visibleRowEnd - visibleRowStart + 2) * virtualCellSize
        );
        drawWorldMapTiles(gameMapCtx);

        cityMaps.forEach(city => {
            const { row, col } = city.worldMapCoordinates;
            const size = worldMapCityRepresentationSize;
            if (row + size > visibleRowStart && row < visibleRowEnd && col + size > visibleColStart && col < visibleColEnd) {
                gameMapCtx.fillStyle = mapColors[`city${city.ownerType.charAt(0).toUpperCase() + city.ownerType.slice(1)}`];
                gameMapCtx.fillRect(col * virtualCellSize, row * virtualCellSize, size * virtualCellSize, size * virtualCellSize);
                gameMapCtx.strokeStyle = mapColors.cityBorder;
                gameMapCtx.lineWidth = 2;
                gameMapCtx.strokeRect(col * virtualCellSize, row * virtualCellSize, size * virtualCellSize, size * virtualCellSize);
            }
        });

    } else { 
        const currentMap = getCurrentMapData();
        let currentGridSizeX, currentGridSizeY;
        if (currentMapType === 'subMap') {
            currentGridSizeX = subMapGridSize; currentGridSizeY = subMapGridSize;
        } else {
            currentGridSizeX = cityGridSize; currentGridSizeY = cityGridSize;
        }
        for (let r = Math.max(0, visibleRowStart); r <= Math.min(currentGridSizeY - 1, visibleRowEnd); r++) {
            for (let c = Math.max(0, visibleColStart); c <= Math.min(currentGridSizeX - 1, visibleColEnd); c++) {
                gameMapCtx.fillStyle = getCellColor(r, c, currentMap); 
                gameMapCtx.fillRect(c * virtualCellSize, r * virtualCellSize, virtualCellSize, virtualCellSize);
            }
        }

        if (currentMapType === 'cityMap') {
            const buildingSize = virtualCellSize * 0.85; 
            const buildingOffset = (virtualCellSize - buildingSize) / 2;
            currentMap.placedBuildings.forEach(building => {
                 if (building.row >= visibleRowStart && building.row <= visibleRowEnd && building.col >= visibleColStart && building.col <= visibleColEnd) {
                    const buildingData = buildingsModule.getBuildingDataByName(building.name);
                    gameMapCtx.fillStyle = buildingData?.color || "#FBC02D";
                    gameMapCtx.fillRect(building.col * virtualCellSize + buildingOffset, building.row * virtualCellSize + buildingOffset, buildingSize, buildingSize);
                    gameMapCtx.fillStyle = '#4A5568';
                    gameMapCtx.font = `bold ${virtualCellSize * 0.18}px Inter`;
                    gameMapCtx.textAlign = 'center';
                    gameMapCtx.textBaseline = 'middle';
                    gameMapCtx.fillText(building.name, building.col * virtualCellSize + virtualCellSize / 2, building.row * virtualCellSize + virtualCellSize / 2);
                }
            });

            const soldierSize = virtualCellSize * 0.7;
            const soldierOffset = (virtualCellSize - soldierSize) / 2;
            (currentMap.teams || []).forEach(team => {
                team.units.forEach(unit => {
                    if (unit && unit.row !== undefined && !unit.inRecruitment) {
                         if (unit.row >= visibleRowStart && unit.row <= visibleRowEnd && unit.col >= visibleColStart && unit.col <= visibleColEnd) {
                            gameMapCtx.fillStyle = mapColors.soldier[unit.type] || '#E2E8F0';
                            gameMapCtx.fillRect(unit.col * virtualCellSize + soldierOffset, unit.row * virtualCellSize + soldierOffset, soldierSize, soldierSize);
                            gameMapCtx.fillStyle = 'white';
                            gameMapCtx.font = `bold ${virtualCellSize * 0.3}px Inter`;
                            gameMapCtx.fillText(unit.name.substring(0, 1), unit.col * virtualCellSize + virtualCellSize / 2, unit.row * virtualCellSize + virtualCellSize / 2);
                        }
                    }
                });
            });
        }
        if (currentMapType === 'subMap' && currentMap.placedObjects) {
            currentMap.placedObjects.forEach(obj => {
                if (obj.row >= visibleRowStart && obj.row <= visibleRowEnd && obj.col >= visibleColStart && obj.col <= visibleColEnd) {
                    gameMapCtx.fillStyle = obj.color;
                    gameMapCtx.font = `${virtualCellSize * 0.7}px sans-serif`;
                    gameMapCtx.textAlign = 'center';
                    gameMapCtx.textBaseline = 'middle';
                    gameMapCtx.fillText(obj.icon, obj.col * virtualCellSize + virtualCellSize / 2, obj.row * virtualCellSize + virtualCellSize / 2);
                }
            });
        }
    }
    
    if (buildingsModule && buildingsModule.isPlacingBuilding()) {
        const preview = buildingsModule.getPlacementPreview();
        if (preview) {
            const buildingSize = virtualCellSize * 0.85; 
            const offsetForCentering = (virtualCellSize - buildingSize) / 2;
            gameMapCtx.fillStyle = preview.isValid ? mapColors.placementValid : mapColors.placementInvalid;
            gameMapCtx.fillRect(preview.col * virtualCellSize + offsetForCentering, preview.row * virtualCellSize + offsetForCentering, buildingSize, buildingSize);
            gameMapCtx.fillStyle = 'white';
            gameMapCtx.font = `bold ${virtualCellSize * 0.2}px Inter`; 
            gameMapCtx.fillText(preview.name, preview.col * virtualCellSize + virtualCellSize / 2, preview.row * virtualCellSize + virtualCellSize / 2);
            
            const iconSize = virtualCellSize * 0.4;
            const previewCenterX = preview.col * virtualCellSize + virtualCellSize / 2;
            const previewCenterY = preview.row * virtualCellSize + virtualCellSize / 2;
            preview.iconSize = iconSize;
            preview.confirmBtn.x = previewCenterX + virtualCellSize * 0.7;
            preview.confirmBtn.y = previewCenterY + virtualCellSize * 0.7;
            preview.cancelBtn.x = previewCenterX - virtualCellSize * 0.7;
            preview.cancelBtn.y = previewCenterY + virtualCellSize * 0.7;

            gameMapCtx.fillStyle = 'rgba(4, 120, 87, 0.9)';
            gameMapCtx.beginPath();
            gameMapCtx.arc(preview.confirmBtn.x, preview.confirmBtn.y, iconSize / 2, 0, Math.PI * 2);
            gameMapCtx.fill();
            gameMapCtx.fillStyle = 'white';
            gameMapCtx.font = `bold ${iconSize * 0.6}px sans-serif`;
            gameMapCtx.fillText('✓', preview.confirmBtn.x, preview.confirmBtn.y);
            
            gameMapCtx.fillStyle = 'rgba(185, 28, 28, 0.9)';
            gameMapCtx.beginPath();
            gameMapCtx.arc(preview.cancelBtn.x, preview.cancelBtn.y, iconSize / 2, 0, Math.PI * 2);
            gameMapCtx.fill();
            gameMapCtx.fillStyle = 'white';
            gameMapCtx.font = `bold ${iconSize * 0.5}px sans-serif`;
            gameMapCtx.fillText('✕', preview.cancelBtn.x, preview.cancelBtn.y);
        }
    }

    if (selectedWorldTile && currentMapType === 'worldMap') {
        gameMapCtx.strokeStyle = mapColors.selectionHighlight;
        gameMapCtx.lineWidth = 4;
        gameMapCtx.strokeRect(selectedWorldTile.col * virtualCellSize + 2, selectedWorldTile.row * virtualCellSize + 2, virtualCellSize - 4, virtualCellSize - 4);
    }

    gameMapCtx.restore();
    requestAnimationFrame(drawMap);
}

function getCellColor(r, c, currentMap) {
    if (currentMapType === 'subMap') {
        return mapColors.outerGrass;
    } else if (currentMapType === 'cityMap') { 
        if (r >= currentMap.MAIN_CITY_MIN_ROW && r <= currentMap.MAIN_CITY_MAX_ROW &&
            c >= currentMap.MAIN_CITY_MIN_COL && c <= currentMap.MAIN_CITY_MAX_COL) {
            return mapColors.innerEarth;
        } else if (r >= (currentMap.MAIN_CITY_MIN_ROW - 1) && r <= (currentMap.MAIN_CITY_MAX_ROW + 1) &&
            c >= (currentMap.MAIN_CITY_MIN_COL - 1) && c <= (currentMap.MAIN_CITY_MAX_COL + 1)) {
            return mapColors.middleEarth;
        } else {
            return mapColors.outerGrass;
        }
    }
    return mapColors.worldMapBackground;
}

function getDomElements() {
    gameViewport = document.getElementById('game-viewport');
    gameMapCanvas = document.getElementById('game-map-canvas');
    gameMapCtx = gameMapCanvas.getContext('2d');
    
    buildButton = document.getElementById('build-button');
    troopsButton = document.getElementById('troops-button');
    infoButton = document.getElementById('info-button');
    backButton = document.getElementById('back-button');
    minimapButton = document.getElementById('minimap-button'); 
    goBackToCityButton = document.getElementById('go-back-to-city-button');
    messageBox = document.getElementById('message-box');

    analysisModalOverlay = document.getElementById('analysis-modal-overlay');
    analysisModalCloseButton = document.getElementById('analysis-modal-close-button');
    infoModalOverlay = document.getElementById('info-modal-overlay');
    infoModalCloseButton = document.getElementById('info-modal-close-button');
    infoToAnalysisButton = document.getElementById('info-to-analysis-button');
    infoToIllustratedGuideButton = document.getElementById('info-to-illustrated-guide-button');
    worldMinimapModalOverlay = document.getElementById('world-minimap-modal-overlay');
    worldMinimapCanvas = document.getElementById('world-minimap-canvas');
    worldMinimapCtx = worldMinimapCanvas.getContext('2d');
    worldMinimapCloseButton = document.getElementById('world-minimap-close-button');
    confirmMinimapViewButton = document.getElementById('confirm-minimap-view-button');
    minimapInputRow = document.getElementById('minimap-input-row');
    minimapInputCol = document.getElementById('minimap-input-col');
    
    tileInteractionUI.overlay = document.getElementById('tile-interaction-overlay');
    tileInteractionUI.container = document.getElementById('tile-interaction-container');
    tileInteractionUI.infoTop = document.getElementById('tile-info-top');
    tileInteractionUI.infoLeft = document.getElementById('tile-info-left');
    tileInteractionUI.actionsRight = document.getElementById('tile-actions-right');
    
    tileInteractionUI.enterButton = document.getElementById('tile-action-enter');
    tileInteractionUI.occupyButton = document.getElementById('tile-action-occupy');
    tileInteractionUI.marchButton = document.getElementById('tile-action-march');
    tileInteractionUI.buildButton = document.getElementById('tile-action-build');
}

function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = gameViewport.getBoundingClientRect();
    gameMapCanvas.width = rect.width * dpr;
    gameMapCanvas.height = rect.height * dpr;
    gameMapCtx.scale(dpr, dpr);
    gameMapCanvas.style.width = `${rect.width}px`;
    gameMapCanvas.style.height = `${rect.height}px`;
}

function initializeWorldMapGrid() {
    for (let r = 0; r < worldMapGridSizeY; r++) {
        worldMapGrid[r] = [];
        for (let c = 0; c < worldMapGridSizeX; c++) {
            const resourceType = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
            const levelRoll = Math.random();
            let level = 1;
            if (levelRoll > 0.95) level = 5;
            else if (levelRoll > 0.85) level = 4;
            else if (levelRoll > 0.70) level = 3;
            else if (levelRoll > 0.40) level = 2;
            
            const productionRate = PRODUCTION_RATES_BY_LEVEL[level] || 2;

            worldMapGrid[r][c] = {
                ownerType: 'neutral',
                resourceType: resourceType,
                level: level,
                productionRate: productionRate, 
                cityDataRef: null,
            };
        }
    }
}


function initializeCityMaps() {
    const occupiedWorldMapCells = new Set();
    function findRandomCityPosition() {
        let attempts = 0;
        const maxAttempts = 1000;
        while (attempts < maxAttempts) {
            const row = Math.floor(Math.random() * (worldMapGridSizeY - worldMapCityRepresentationSize));
            const col = Math.floor(Math.random() * (worldMapGridSizeX - worldMapCityRepresentationSize));
            let isOccupied = false;
            for (let r = row; r < row + worldMapCityRepresentationSize; r++) {
                for (let c = col; c < col + worldMapCityRepresentationSize; c++) {
                    if (occupiedWorldMapCells.has(`${r},${c}`)) {
                        isOccupied = true;
                        break;
                    }
                }
                if (isOccupied) break;
            }
            if (!isOccupied) {
                for (let r = row; r < row + worldMapCityRepresentationSize; r++) {
                    for (let c = col; c < col + worldMapCityRepresentationSize; c++) {
                        occupiedWorldMapCells.add(`${r},${c}`);
                    }
                }
                return { row, col };
            }
            attempts++;
        }
        return { row: 0, col: 0 };
    }
    function designateCityArea(startRow, startCol, owner, cityData) {
        for (let r = startRow; r < startRow + worldMapCityRepresentationSize; r++) {
            for (let c = startCol; c < startCol + worldMapCityRepresentationSize; c++) {
                if (worldMapGrid[r] && worldMapGrid[r][c]) {
                    worldMapGrid[r][c].ownerType = owner;
                    worldMapGrid[r][c].cityDataRef = cityData;
                }
            }
        }
    }
    const mainCityCoords = findRandomCityPosition();
    const playerCity = {
        id: 'city1', name: '主城', ownerType: 'player', 
        MAIN_CITY_MIN_ROW: 6, MAIN_CITY_MAX_ROW: 10,
        MAIN_CITY_MIN_COL: 6, MAIN_CITY_MAX_COL: 10, mainCityCenterX: 8, mainCityCenterY: 8,
        placedBuildings: [{ name: "主城", row: 8, col: 8 }], 
        teams: [], preTrainingQueue: {}, worldMapCoordinates: mainCityCoords
    };
    cityMaps.push(playerCity);
    designateCityArea(mainCityCoords.row, mainCityCoords.col, 'player', playerCity);

    const enemyCityCoords = findRandomCityPosition();
    const enemyCity = {
        id: 'city2', name: '敵方城市', ownerType: 'enemy',
        MAIN_CITY_MIN_ROW: 6, MAIN_CITY_MAX_ROW: 10,
        MAIN_CITY_MIN_COL: 6, MAIN_CITY_MAX_COL: 10, mainCityCenterX: 8, mainCityCenterY: 8,
        placedBuildings: [{ name: "主城", row: 8, col: 8 }],
        teams: [], preTrainingQueue: {}, worldMapCoordinates: enemyCityCoords
    };
    cityMaps.push(enemyCity);
    designateCityArea(enemyCityCoords.row, enemyCityCoords.col, 'enemy', enemyCity);

    const allyCityCoords = findRandomCityPosition();
    const allyCity = {
        id: 'city3', name: '盟友城市', ownerType: 'ally',
        MAIN_CITY_MIN_ROW: 6, MAIN_CITY_MAX_ROW: 10,
        MAIN_CITY_MIN_COL: 6, MAIN_CITY_MAX_COL: 10, mainCityCenterX: 8, mainCityCenterY: 8,
        placedBuildings: [{ name: "主城", row: 8, col: 8 }],
        teams: [], preTrainingQueue: {}, worldMapCoordinates: allyCityCoords
    };
    cityMaps.push(allyCity);
    designateCityArea(allyCityCoords.row, allyCityCoords.col, 'ally', allyCity);
}


function generateSubMapData(worldRow, worldCol) {
    const key = `${worldRow},${worldCol}`;
    const worldTile = worldMapGrid[worldRow][worldCol];
    const newMap = {
        id: `submap_${key}`,
        name: `${worldTile.resourceType}地 (${worldCol}, ${worldRow})`,
        gridSize: subMapGridSize,
        type: 'subMap',
        placedObjects: [],
        worldCoords: { row: worldRow, col: worldCol }
    };
    let icon, color;
    if (worldTile.resourceType === '木頭') { icon = '🌲'; color = '#228B22'; } 
    else if (worldTile.resourceType === '石頭') { icon = '🪨'; color = '#708090'; } 
    else { icon = '🌾'; color = '#FBBF24'; }
    for (let i = 0; i < subMapGridSize * subMapGridSize / 5; i++) {
        const r = Math.floor(Math.random() * subMapGridSize);
        const c = Math.floor(Math.random() * subMapGridSize);
        if (!newMap.placedObjects.some(p => p.row === r && p.col === c)) {
            newMap.placedObjects.push({ row: r, col: c, icon, color });
        }
    }
    return newMap;
}

function getVisibleWorldBounds() {
    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
    const viewportWidthPx = gameViewport.clientWidth;
    const viewportHeightPx = gameViewport.clientHeight;
    return {
        visibleColStart: Math.floor(-currentMapTranslateX / virtualCellSize),
        visibleColEnd: Math.floor((-currentMapTranslateX + viewportWidthPx) / virtualCellSize),
        visibleRowStart: Math.floor(-currentMapTranslateY / virtualCellSize),
        visibleRowEnd: Math.floor((-currentMapTranslateY + viewportHeightPx) / virtualCellSize),
    };
}

function handlePointerDown(e) {
    const isModalVisible = (buildingsModule && (buildingsModule.isBuildModalVisible() || buildingsModule.isUnitTrainingModalVisible() || buildingsModule.isTroopListModalVisible() || buildingsModule.isCreateTeamConfirmModalVisible())) ||
                           (illustratedGuideModule && illustratedGuideModule.isAnyIllustratedGuideModalVisible()) ||
                           !analysisModalOverlay.classList.contains('hidden') ||
                           !infoModalOverlay.classList.contains('hidden') ||
                           !worldMinimapModalOverlay.classList.contains('hidden');

    if (e.target.closest('button') || e.target.closest('.tile-interaction-element') || isModalVisible) {
        return;
    }
    
    const { row, col } = getMapCoordsFromPointer(e.clientX, e.clientY);
    const rect = gameMapCanvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const mapX = screenX - currentMapTranslateX;
    const mapY = screenY - currentMapTranslateY;
    
    if (buildingsModule && buildingsModule.isPlacingBuilding()) {
        const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
        const clickedButton = buildingsModule.checkPlacementButtonClick(mapX, mapY);

        if (clickedButton) {
            if (clickedButton === 'confirm') buildingsModule.handleConfirmPlacement();
            else if (clickedButton === 'cancel') buildingsModule.handleCancelPlacement();
            return;
        }

        if (buildingsModule.isPointerOnPreview(mapX, mapY, virtualCellSize)) {
            buildingsModule.startDraggingPreview();
            pointerState.isDown = true;
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
            e.preventDefault();
            return;
        }
    }
    
    if (currentMapType === 'cityMap' && !buildingsModule.isPlacingBuilding()) {
        const currentMap = getCurrentMapData();
        const building = currentMap.placedBuildings.find(b => b.row === row && b.col === col);
        if (building && building.name !== "主城") { 
            longPressTimer = setTimeout(() => {
                isDragging = false; 
                pointerState.hasMoved = true; 
                longPressTimer = null;
                buildingsModule.startRepositioning(building);
            }, LONG_PRESS_DURATION);
        }
    }

    if (isCameraLocked && !(buildingsModule && buildingsModule.isPlacingBuilding())) return;

    e.preventDefault();
    pointerState = { isDown: true, startX: e.clientX, startY: e.clientY, hasMoved: false };
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
}


function handlePointerMove(e) {
    if (buildingsModule && buildingsModule.isPreviewBeingDragged()) {
        buildingsModule.handleBuildingPlacementMove(e);
        return; 
    }

    if (!pointerState.isDown) return;
    
    if (!pointerState.hasMoved) {
        const deltaX = Math.abs(e.clientX - pointerState.startX);
        const deltaY = Math.abs(e.clientY - pointerState.startY);
        if (deltaX > MAX_MOVE_FOR_CLICK || deltaY > MAX_MOVE_FOR_CLICK) {
            pointerState.hasMoved = true;
            isDragging = true;
            gameViewport.classList.add('dragging');
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
    }

    if (isDragging) {
        updateCameraPosition(e.clientX - lastPointerX, e.clientY - lastPointerY);
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
    }
}



function handlePointerUp(e) {
    if (!pointerState.isDown) return;

    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (buildingsModule && buildingsModule.isPreviewBeingDragged()) {
        buildingsModule.stopDraggingPreview();
    }
    
    if (e.target === tileInteractionUI.overlay) {
        clearSelectedTile();
    } else if (!pointerState.hasMoved) {
        handleMapClick(e);
    }
    
    pointerState.isDown = false;
    isDragging = false;
    gameViewport.classList.remove('dragging');
}

function handleMapClick(e) {
    const { row, col } = getMapCoordsFromPointer(e.clientX, e.clientY);

    if (buildingsModule && buildingsModule.isPlacingBuilding()) {
        const rect = gameMapCanvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const mapX = screenX - currentMapTranslateX;
        const mapY = screenY - currentMapTranslateY;
        
        const clickedButton = buildingsModule.checkPlacementButtonClick(mapX, mapY);
        if(!clickedButton) {
            buildingsModule.setPreviewPosition(row, col);
        }
        return;
    }

    if (currentMapType === 'worldMap') {
        if (row < 0 || col < 0 || row >= worldMapGridSizeY || col >= worldMapGridSizeX) {
            clearSelectedTile(); 
            return;
        }
        const tileData = worldMapGrid[row][col];
        if (tileData.cityDataRef) {
            clearSelectedTile(); 
            const cityIndex = cityMaps.findIndex(city => city.id === tileData.cityDataRef.id);
            if (cityIndex !== -1) switchToCityMap(cityIndex);
            return;
        }
        const clickedOnSameTile = selectedWorldTile && selectedWorldTile.row === row && selectedWorldTile.col === col;
        if (clickedOnSameTile) {
            clearSelectedTile();
            return;
        }
        selectedWorldTile = { row, col };
        showTileInteractionUI();
        return;
    }

    if (currentMapType === 'cityMap') {
        clearSelectedTile();
        const currentMap = getCurrentMapData();
        const soldier = findSoldierAt(row, col, currentMap.teams);
        if (soldier) { 
            illustratedGuideModule?.showSoldierDetailModal(soldier); 
            return;
        }
        const building = currentMap.placedBuildings.find(b => b.row === row && b.col === col);
        if (building) {
            handleBuildingClick(building);
            return;
        }
    }
}


function getMapCoordsFromPointer(pointerX, pointerY) {
    const rect = gameMapCanvas.getBoundingClientRect();
    const x = pointerX - rect.left;
    const y = pointerY - rect.top;
    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
    const col = Math.floor((x - currentMapTranslateX) / virtualCellSize);
    const row = Math.floor((y - currentMapTranslateY) / virtualCellSize);
    return { row, col };
}

function convertMapToScreenCoords(row, col) {
    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
    const screenX = col * virtualCellSize;
    const screenY = row * virtualCellSize;
    return { x: screenX, y: screenY };
}

function updateTileInteractionContentAndPosition() {
    if (!selectedWorldTile) return;

    const { row, col } = selectedWorldTile;
    const tileData = worldMapGrid[row][col];
    const rect = gameMapCanvas.getBoundingClientRect();
    const virtualCellSize = gameViewport.clientHeight / cameraHeightInCells;
    
    const screenX = col * virtualCellSize + currentMapTranslateX + rect.left;
    const screenY = row * virtualCellSize + currentMapTranslateY + rect.top;

    const container = tileInteractionUI.container;
    container.style.left = `${screenX}px`;
    container.style.top = `${screenY}px`;
    container.style.width = `${virtualCellSize}px`;
    container.style.height = `${virtualCellSize}px`;

    tileInteractionUI.infoTop.innerHTML = `<p class="font-bold">${tileData.resourceType}地 ${tileData.level}級</p><p>(${col}, ${row})</p>`;
    tileInteractionUI.infoLeft.innerHTML = `<p>${tileData.resourceType} +${tileData.productionRate}/小時</p>`;
}

function showTileInteractionUI() {
    if (!selectedWorldTile || currentMapType !== 'worldMap') return;
    updateTileInteractionContentAndPosition(); 
    tileInteractionUI.overlay.classList.remove('hidden');
    setTimeout(() => {
        tileInteractionUI.overlay.classList.add('active');
    }, 10);
}

function clearSelectedTile() {
    selectedWorldTile = null;
    if (tileInteractionUI.overlay) {
        tileInteractionUI.overlay.classList.remove('active');
        setTimeout(() => {
            if (!tileInteractionUI.overlay.classList.contains('active')) {
                 tileInteractionUI.overlay.classList.add('hidden');
            }
        }, 300); 
    }
}


function updateCameraPosition(deltaX, deltaY) {
    currentMapTranslateX += deltaX;
    currentMapTranslateY += deltaY;
    const viewportWidthPx = gameViewport.clientWidth;
    const viewportHeightPx = gameViewport.clientHeight;
    const virtualCellSize = viewportHeightPx / cameraHeightInCells;
    let currentGridSizeX, currentGridSizeY;
    if (currentMapType === 'worldMap') {
        currentGridSizeX = worldMapGridSizeX; currentGridSizeY = worldMapGridSizeY;
    } else if (currentMapType === 'subMap') {
        currentGridSizeX = subMapGridSize; currentGridSizeY = subMapGridSize;
    } else {
        currentGridSizeX = cityGridSize; currentGridSizeY = cityGridSize;
    }
    const mapPixelWidth = currentGridSizeX * virtualCellSize;
    const mapPixelHeight = currentGridSizeY * virtualCellSize;
    const minTranslateX = viewportWidthPx > mapPixelWidth ? (viewportWidthPx - mapPixelWidth) / 2 : viewportWidthPx - mapPixelWidth - virtualCellSize;
    const maxTranslateX = viewportWidthPx > mapPixelWidth ? (viewportWidthPx - mapPixelWidth) / 2 : virtualCellSize;
    const minTranslateY = viewportHeightPx > mapPixelHeight ? (viewportHeightPx - mapPixelHeight) / 2 : viewportHeightPx - mapPixelHeight - virtualCellSize;
    const maxTranslateY = viewportHeightPx > mapPixelHeight ? (viewportHeightPx - mapPixelHeight) / 2 : virtualCellSize;
    currentMapTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, currentMapTranslateX));
    currentMapTranslateY = Math.max(minTranslateY, Math.min(maxTranslateY, currentMapTranslateY));
    
    if (selectedWorldTile && !tileInteractionUI.overlay.classList.contains('hidden')) {
        updateTileInteractionContentAndPosition();
    }
}

function centerCamera(targetRow, targetCol, mapType = 'cityMap') {
    const viewportWidthPx = gameViewport.clientWidth;
    const viewportHeightPx = gameViewport.clientHeight;
    const virtualCellSize = viewportHeightPx / cameraHeightInCells;
    const targetXInMap = (targetCol + 0.5) * virtualCellSize;
    const targetYInMap = (targetRow + 0.5) * virtualCellSize;
    currentMapTranslateX = (viewportWidthPx / 2) - targetXInMap;
    currentMapTranslateY = (viewportHeightPx / 2) - targetYInMap;
    updateCameraPosition(0, 0); 
}

function switchToCityMap(cityIndex) {
    currentMapType = 'cityMap';
    currentCityIndex = cityIndex;
    clearSelectedTile();
    showMessage(`進入 ${cityMaps[currentCityIndex].name}`, 'info');
    updateUIVisibility();
    setTimeout(() => {
        centerCamera(cityMaps[currentCityIndex].mainCityCenterY, cityMaps[currentCityIndex].mainCityCenterX, 'cityMap');
        updateAnalysisCharts();
    }, 50);
}

function switchToSubMap(row, col) {
    const key = `${row},${col}`;
    if (!resourceNodeMaps[key]) resourceNodeMaps[key] = generateSubMapData(row, col);
    currentMapType = 'subMap';
    currentSubMapKey = key;
    clearSelectedTile();
    showMessage(`進入資源點 (${col}, ${row})`, 'info');
    updateUIVisibility();
    setTimeout(() => {
        centerCamera(Math.floor(subMapGridSize / 2), Math.floor(subMapGridSize / 2), 'subMap');
    }, 50);
}

function handleBackButtonClick() {
    if (currentMapType === 'cityMap') {
        const departingCityWorldCoords = cityMaps[currentCityIndex].worldMapCoordinates;
        currentMapType = 'worldMap';
        showMessage(`已切換到世界地圖`, 'info');
        centerCamera(departingCityWorldCoords.row, departingCityWorldCoords.col, 'worldMap');
    } else if (currentMapType === 'subMap') {
        const [row, col] = currentSubMapKey.split(',').map(Number);
        currentMapType = 'worldMap';
        currentSubMapKey = null;
        showMessage(`已返回世界地圖`, 'info');
        centerCamera(row, col, 'worldMap');
    }
    updateAnalysisCharts();
    updateUIVisibility();
}

function isCityVisibleOnScreen(cityCoords) {
    const viewportWidthPx = gameViewport.clientWidth;
    const viewportHeightPx = gameViewport.clientHeight;
    const virtualCellSize = viewportHeightPx / cameraHeightInCells;
    const mapVisiblePxX1 = -currentMapTranslateX;
    const mapVisiblePxY1 = -currentMapTranslateY;
    const mapVisiblePxX2 = mapVisiblePxX1 + viewportWidthPx;
    const mapVisiblePxY2 = mapVisiblePxY1 + viewportHeightPx;
    const cityPxX1 = cityCoords.col * virtualCellSize;
    const cityPxY1 = cityCoords.row * virtualCellSize;
    const cityPxX2 = (cityCoords.col + worldMapCityRepresentationSize) * virtualCellSize;
    const cityPxY2 = (cityCoords.row + worldMapCityRepresentationSize) * virtualCellSize;
    const overlapX = Math.max(0, Math.min(mapVisiblePxX2, cityPxX2) - Math.max(mapVisiblePxX1, cityPxX1));
    const overlapY = Math.max(0, Math.min(mapVisiblePxY2, cityPxY2) - Math.max(mapVisiblePxY1, cityPxY1));
    return overlapX > 0 && overlapY > 0;
}

function handleGoToCityButtonClick() {
    if (currentMapType === 'worldMap') {
        const playerCities = cityMaps.filter(city => city.ownerType === 'player');
        if (playerCities.length === 0) { showMessage("你沒有任何城市可以定位。", "error"); return; }
        let targetCity = null;
        if (playerCities.length === 1) {
            const singlePlayerCity = playerCities[0];
            if (!isCityVisibleOnScreen(singlePlayerCity.worldMapCoordinates)) targetCity = singlePlayerCity;
            else { showMessage("你的主城已在畫面內。", "info"); return; }
        } else {
            const invisibleCities = playerCities.filter(city => !isCityVisibleOnScreen(city.worldMapCoordinates));
            if (invisibleCities.length > 0) targetCity = invisibleCities[0];
            else {
                const viewportWidthPx = gameViewport.clientWidth;
                const viewportHeightPx = gameViewport.clientHeight;
                const virtualCellSize = viewportHeightPx / cameraHeightInCells;
                const currentCameraCenterX = (viewportWidthPx / 2 - currentMapTranslateX) / virtualCellSize;
                const currentCameraCenterY = (viewportHeightPx / 2 - currentMapTranslateY) / virtualCellSize;
                let closestCityIndex = -1; let minDistance = Infinity;
                playerCities.forEach((city, index) => {
                    const cityCenterX = city.worldMapCoordinates.col + worldMapCityRepresentationSize / 2;
                    const cityCenterY = city.worldMapCoordinates.row + worldMapCityRepresentationSize / 2;
                    const distance = Math.sqrt(Math.pow(currentCameraCenterX - cityCenterX, 2) + Math.pow(currentCameraCenterY - cityCenterY, 2));
                    if (distance < minDistance) { minDistance = distance; closestCityIndex = index; }
                });
                const nextIndex = (closestCityIndex + 1) % playerCities.length;
                targetCity = playerCities[nextIndex];
                showMessage(`所有你的城市都已在畫面內，正在切換到『${targetCity.name}』。`, 'info');
            }
        }
        if (targetCity) {
            centerCamera(targetCity.worldMapCoordinates.row, targetCity.worldMapCoordinates.col, 'worldMap');
            showMessage(`已定位到你的城市：『${targetCity.name}』。`, 'info');
        }
    } 
    updateUIVisibility();
}

async function initializeGameData() {
    try {
        soldiersModule = await import('./soldiers.js');
        allSoldiersData = soldiersModule.getAllSoldiersData();
        
        illustratedGuideModule = await import('./illustratedGuide.js');
        illustratedGuideModule.init({
            illustratedGuideModalOverlay: document.getElementById('illustrated-guide-modal-overlay'),
            illustratedGuideModalContent: document.getElementById('illustrated-guide-modal-content'),
            illustratedGuideModalCloseButton: document.getElementById('illustrated-guide-modal-close-button'),
            policyButton: document.getElementById('policy-button'),
            soldierButton: document.getElementById('soldier-button'),
            equipmentButton: document.getElementById('equipment-button'),
            portraitButton: document.getElementById('portrait-button'),
            policyContent: document.getElementById('policy-content'),
            soldierContent: document.getElementById('soldier-content'),
            equipmentContent: document.getElementById('equipment-content'),
            portraitContent: document.getElementById('portrait-content'),
            policyDetailModalOverlay: document.getElementById('policy-detail-modal-overlay'),
            policyDetailModalContent: document.getElementById('policy-detail-modal-content'),
            policyDetailCloseButton: document.getElementById('policy-detail-close-button'),
            policyDetailImage: document.getElementById('policy-detail-image'),
            policyDetailName: document.getElementById('policy-detail-name'),
            policyDetailDescription: document.getElementById('policy-detail-description'),
            soldierDetailModalOverlay: document.getElementById('soldier-detail-modal-overlay'),
            soldierDetailModalContent: document.getElementById('soldier-detail-modal-content'),
            soldierDetailCloseButton: document.getElementById('soldier-detail-close-button'),
            soldierDetailImage: document.getElementById('soldier-detail-image'),
            soldierDetailName: document.getElementById('soldier-detail-name'),
            soldierDetailLevel: document.getElementById('soldier-detail-level'),
            soldierDetailType: document.getElementById('soldier-detail-type'),
            soldierDetailHP: document.getElementById('soldier-detail-hp'),
            soldierDetailRage: document.getElementById('soldier-detail-rage'),
            soldierDetailMoveRange: document.getElementById('soldier-detail-move-range'),
            soldierDetailFoodCost: document.getElementById('soldier-detail-food-cost'),
            soldierDetailMoveSpeed: document.getElementById('soldier-detail-move-speed'),
            pSoldierDetailAttackValue: document.getElementById('p-soldier-detail-attack-value'),
            soldierDetailAttackValue: document.getElementById('soldier-detail-attack-value'),
            pSoldierDetailAttackRangeValue: document.getElementById('p-soldier-detail-attack-range-value'),
            soldierDetailAttackRangeValue: document.getElementById('soldier-detail-attack-range-value'),
            pSoldierDetailDamageReductionValue: document.getElementById('p-soldier-detail-damage-reduction-value'),
            soldierDetailDamageReductionValue: document.getElementById('soldier-detail-damage-reduction-value'),
            pSoldierDetailLifestealValue: document.getElementById('p-soldier-detail-lifesteal-value'),
            soldierDetailLifestealValue: document.getElementById('soldier-detail-lifesteal-value'),
            pSoldierDetailHpRegenValue: document.getElementById('p-soldier-detail-hp-regen-value'),
            soldierDetailHpRegenValue: document.getElementById('soldier-detail-hp-regen-value'),
            pSoldierDetailEvasionValue: document.getElementById('p-soldier-detail-evasion-value'),
            soldierDetailEvasionValue: document.getElementById('soldier-detail-evasion-value'),
            pSoldierDetailShield: document.getElementById('p-soldier-detail-shield'),
            soldierDetailShield: document.getElementById('soldier-detail-shield'),
            pSoldierDetailBlock: document.getElementById('p-soldier-detail-block'),
            soldierDetailBlock: document.getElementById('soldier-detail-block'),
            pSoldierDetailParry: document.getElementById('p-soldier-detail-parry'),
            soldierDetailParry: document.getElementById('soldier-detail-parry'),
            soldierDetailSkills: document.getElementById('soldier-detail-skills'),
            noSkillsMessage: document.getElementById('no-skills-message'),
            equipmentDetailModalOverlay: document.getElementById('equipment-detail-modal-overlay'),
            equipmentDetailModalContent: document.getElementById('equipment-detail-modal-content'),
            equipmentDetailCloseButton: document.getElementById('equipment-detail-close-button'),
            equipmentDetailImage: document.getElementById('equipment-detail-image'),
            equipmentDetailName: document.getElementById('equipment-detail-name'),
            equipmentDetailDescription: document.getElementById('equipment-detail-description'),
            attackDetailsModalOverlay: document.getElementById('attack-details-modal-overlay'),
            attackDetailsCloseButton: document.getElementById('attack-details-close-button'),
            attackDetailsContent: document.getElementById('attack-details-content'),
            attackRangeDetailsModalOverlay: document.getElementById('attack-range-details-modal-overlay'),
            attackRangeDetailsCloseButton: document.getElementById('attack-range-details-close-button'),
            attackRangeDetailsContent: document.getElementById('attack-range-details-content'),
            damageReductionDetailsModalOverlay: document.getElementById('damage-reduction-details-modal-overlay'),
            damageReductionDetailsCloseButton: document.getElementById('damage-reduction-details-close-button'),
            damageReductionDetailsContent: document.getElementById('damage-reduction-details-content'),
            lifestealDetailsModalOverlay: document.getElementById('lifesteal-details-modal-overlay'),
            lifestealDetailsCloseButton: document.getElementById('lifesteal-details-close-button'),
            lifestealDetailsContent: document.getElementById('lifesteal-details-content'),
            hpRegenDetailsModalOverlay: document.getElementById('hp-regen-details-modal-overlay'),
            hpRegenDetailsCloseButton: document.getElementById('hp-regen-details-close-button'),
            hpRegenDetailsContent: document.getElementById('hp-regen-details-content'),
            evasionDetailsModalOverlay: document.getElementById('evasion-details-modal-overlay'),
            evasionDetailsCloseButton: document.getElementById('evasion-details-close-button'),
            evasionDetailsContent: document.getElementById('evasion-details-content'),
            skillPopupModalOverlay: document.getElementById('skill-popup-modal-overlay'),
            skillPopupCloseButton: document.getElementById('skill-popup-close-button'),
            skillPopupImage: document.getElementById('skill-popup-image'),
            skillPopupType: document.getElementById('skill-popup-type'),
            skillPopupName: document.getElementById('skill-popup-name'),
            skillPopupDescription: document.getElementById('skill-popup-description'),
        }, showMessage);

        buildingsModule = await import('./buildings.js');
        buildingsModule.init(showMessage, updateAnalysisCharts, gameViewport, null, cityGridSize, cameraHeightInCells, null, getBuildingCount, setCameraLock, centerCamera, getCurrentMapTranslation, getCurrentMapData, getCurrentMapType, allSoldiersData, drawMap);
    } catch (error) {
        console.error("無法載入遊戲模組:", error);
        showMessage("遊戲核心檔案載入失敗，請重新整理頁面。", "error");
    }
}

// [核心修正] 將所有與 UI 互動的函式移到 setupEventListeners 之前，以確保它們已被定義
function showMessage(message, type = 'info') { 
    messageBox.innerText = message;
    messageBox.className = 'fixed top-5 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 ease-out opacity-0 pointer-events-none';
    messageBox.classList.add(type === 'error' ? 'bg-red-600' : 'bg-green-600');
    messageBox.classList.add('opacity-100');
    clearTimeout(messageBox.timer);
    messageBox.timer = setTimeout(() => { messageBox.classList.remove('opacity-100'); }, 2000);
}

function showAnalysisModal() { 
    if (currentMapType !== 'cityMap' || cityMaps[currentCityIndex]?.ownerType !== 'player') { showMessage("請先進入自己的城市查看分析數據。", "error"); return; }
    updateAnalysisCharts();
    analysisModalOverlay.classList.remove('hidden');
}
function hideAnalysisModal() { analysisModalOverlay.classList.add('hidden'); }
function showInfoModal() { infoModalOverlay.classList.remove('hidden'); }
function hideInfoModal() { infoModalOverlay.classList.add('hidden'); }

function showWorldMinimap() { 
    worldMinimapModalOverlay.classList.remove('hidden');
    resizeMinimapCanvas();
    const viewportWidthPx = gameViewport.clientWidth; const viewportHeightPx = gameViewport.clientHeight; const virtualCellSize = viewportHeightPx / cameraHeightInCells;
    const cameraCenterX = (viewportWidthPx / 2 - currentMapTranslateX) / virtualCellSize; const cameraCenterY = (viewportHeightPx / 2 - currentMapTranslateY) / virtualCellSize;
    const currentCameraRow = Math.max(0, Math.min(worldMapGridSizeY - 1, Math.round(cameraCenterY)));
    const currentCameraCol = Math.max(0, Math.min(worldMapGridSizeX - 1, Math.round(cameraCenterX)));
    minimapInputRow.value = currentCameraRow; minimapInputCol.value = currentCameraCol;
    selectedMinimapViewpoint = { row: currentCameraRow, col: currentCameraCol };
    drawWorldMinimap();
}
function hideWorldMinimap() { worldMinimapModalOverlay.classList.add('hidden'); selectedMinimapViewpoint = { row: -1, col: -1 }; }

function handleInfoButtonClick() { showInfoModal(); }
function handleInfoToAnalysisClick() { hideInfoModal(); showAnalysisModal(); }

function setupEventListeners() {
    gameMapCanvas.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointerleave', handlePointerUp);
    buildButton.addEventListener('click', () => buildingsModule?.showBuildModal());
    minimapButton.addEventListener('click', showWorldMinimap);
    troopsButton.addEventListener('click', () => buildingsModule?.showTroopListModal());
    infoButton.addEventListener('click', handleInfoButtonClick);
    backButton.addEventListener('click', handleBackButtonClick);
    goBackToCityButton.addEventListener('click', handleGoToCityButtonClick);
    analysisModalOverlay.addEventListener('click', (e) => e.target === analysisModalOverlay && hideAnalysisModal());
    analysisModalCloseButton.addEventListener('click', hideAnalysisModal);
    infoModalOverlay.addEventListener('click', (e) => e.target === infoModalOverlay && hideInfoModal());
    infoModalCloseButton.addEventListener('click', hideInfoModal);
    infoToAnalysisButton.addEventListener('click', handleInfoToAnalysisClick);
    infoToIllustratedGuideButton.addEventListener('click', () => { hideInfoModal(); illustratedGuideModule?.showIllustratedGuideModal(); });
    worldMinimapCloseButton.addEventListener('click', hideWorldMinimap);
    worldMinimapModalOverlay.addEventListener('click', (e) => e.target === worldMinimapModalOverlay && hideWorldMinimap());
    worldMinimapCanvas.addEventListener('click', handleMinimapClick);
    confirmMinimapViewButton.addEventListener('click', handleConfirmMinimapView);
    tileInteractionUI.enterButton.addEventListener('click', () => { if (selectedWorldTile) switchToSubMap(selectedWorldTile.row, selectedWorldTile.col); });
    tileInteractionUI.occupyButton.addEventListener('click', () => { if (selectedWorldTile) { showMessage(`對座標 (${selectedWorldTile.col}, ${selectedWorldTile.row}) 發動攻佔... (功能待實現)`, 'info'); clearSelectedTile(); } });
    tileInteractionUI.marchButton.addEventListener('click', () => { if (selectedWorldTile) { showMessage(`向座標 (${selectedWorldTile.col}, ${selectedWorldTile.row}) 行進... (功能待實現)`, 'info'); clearSelectedTile(); } });
    tileInteractionUI.buildButton.addEventListener('click', () => { if (selectedWorldTile) { showMessage(`在座標 (${selectedWorldTile.col}, ${selectedWorldTile.row}) 進行修建... (功能待實現)`, 'info'); clearSelectedTile(); } });
    
    tileInteractionUI.overlay.addEventListener('click', (e) => {
        if (e.target === tileInteractionUI.overlay) {
            clearSelectedTile();
        }
    });
    tileInteractionUI.overlay.addEventListener('transitionend', () => {
        if (!tileInteractionUI.overlay.classList.contains('active')) {
            tileInteractionUI.overlay.classList.add('hidden');
        }
    });

    window.addEventListener('resize', () => { setupCanvas(); if (!worldMinimapModalOverlay.classList.contains('hidden')) { resizeMinimapCanvas(); drawWorldMinimap(); } if(selectedWorldTile) updateTileInteractionContentAndPosition(); });
}

function findSoldierAt(row, col, teams) {
    if (!teams) return null;
    for (const team of teams) {
        for (const unit of team.units) {
            if (unit && unit.row === row && unit.col === col && !unit.inRecruitment) return unit;
        }
    }
    return null;
}

function updateUIVisibility() {
    const isPlayerInOwnCity = currentMapType === 'cityMap' && cityMaps[currentCityIndex]?.ownerType === 'player';
    buildButton.style.display = isPlayerInOwnCity ? 'flex' : 'none';
    troopsButton.style.display = isPlayerInOwnCity ? 'flex' : 'none';
    backButton.style.display = (currentMapType === 'cityMap' || currentMapType === 'subMap') ? 'flex' : 'none';
    minimapButton.style.display = currentMapType === 'worldMap' ? 'flex' : 'none';
    goBackToCityButton.style.display = currentMapType === 'worldMap' ? 'flex' : 'none';

    if (currentMapType !== 'worldMap') {
        clearSelectedTile();
    }
}

function handleBuildingClick(buildingData) {
    if (cityMaps[currentCityIndex]?.ownerType !== 'player') { showMessage(`這不是你的城市，無法操作其建築。`, 'error'); return; }
    if (["兵營", "馬廄", "工廠"].includes(buildingData.name)) { buildingsModule?.showUnitTrainingModal(buildingData); } 
    else { showMessage(`您點擊了 ${buildingData.name}，目前沒有專屬功能。`, 'info'); }
}

function getBuildingCount(buildingName) {
    if (currentMapType !== 'cityMap') return 0;
    const currentCity = cityMaps[currentCityIndex];
    return currentCity.placedBuildings.filter(b => b.name === buildingName).length;
}

function getCurrentMapData() {
    if (currentMapType === 'worldMap') { return { id: 'worldMap', name: '世界地圖', gridSizeX: worldMapGridSizeX, gridSizeY: worldMapGridSizeY, type: 'worldMap', cities: cityMaps.map(c => ({ ...c.worldMapCoordinates, id: c.id, ownerType: c.ownerType })) }; } 
    else if (currentMapType === 'subMap') { return resourceNodeMaps[currentSubMapKey]; } 
    else { return cityMaps[currentCityIndex]; }
}

function setCameraLock(locked) { isCameraLocked = locked; gameViewport.classList.toggle('locked', locked); }
function getCurrentMapType() { return currentMapType; }
function getCurrentMapTranslation() { return { x: currentMapTranslateX, y: currentMapTranslateY }; }


function resizeMinimapCanvas() { 
    if (!worldMinimapCanvas || worldMinimapModalOverlay.classList.contains('hidden')) return;
    const dpr = window.devicePixelRatio || 1;
    const parentContainer = worldMinimapCanvas.parentElement;
    const size = Math.min(parentContainer.clientWidth, parentContainer.clientHeight);
    worldMinimapCanvas.width = size * dpr; worldMinimapCanvas.height = size * dpr;
    worldMinimapCtx.scale(dpr, dpr);
    worldMinimapCanvas.style.width = `${size}px`;
    worldMinimapCanvas.style.height = `${size}px`;
}

function drawWorldMinimap() { 
    if (!worldMinimapCtx || !worldMinimapCanvas) return;
    worldMinimapCtx.fillStyle = mapColors.minimapBackground;
    worldMinimapCtx.fillRect(0, 0, worldMinimapCanvas.width, worldMinimapCanvas.height);
    const miniCellSize = worldMinimapCanvas.width / worldMapGridSizeX;
    for (let r = 0; r < worldMapGridSizeY; r++) {
        for (let c = 0; c < worldMapGridSizeX; c++) {
            const cell = worldMapGrid[r][c];
            if (cell.cityDataRef) {
                switch(cell.ownerType) {
                    case 'player': 
                        worldMinimapCtx.fillStyle = mapColors.cityPlayer;
                        break;
                    case 'enemy': 
                        worldMinimapCtx.fillStyle = mapColors.cityEnemy;
                        break;
                    case 'ally': 
                        worldMinimapCtx.fillStyle = mapColors.cityAlly;
                        break;
                    default: 
                        worldMinimapCtx.fillStyle = mapColors.cityNeutral;
                }
                worldMinimapCtx.fillRect(c * miniCellSize, r * miniCellSize, miniCellSize, miniCellSize);
            }
        }
    }
    if (selectedMinimapViewpoint.row !== -1) {
        worldMinimapCtx.strokeStyle = 'red'; 
        worldMinimapCtx.lineWidth = 2;
        worldMinimapCtx.strokeRect(selectedMinimapViewpoint.col * miniCellSize, selectedMinimapViewpoint.row * miniCellSize, miniCellSize, miniCellSize);
    }
    const viewportHeightPx = gameViewport.clientHeight; 
    const virtualCellSize = viewportHeightPx / cameraHeightInCells;
    const cameraCol = Math.floor((gameViewport.clientWidth / 2 - currentMapTranslateX) / virtualCellSize);
    const cameraRow = Math.floor((viewportHeightPx / 2 - currentMapTranslateY) / virtualCellSize);
    worldMinimapCtx.strokeStyle = 'lime'; 
    worldMinimapCtx.lineWidth = 2;
    worldMinimapCtx.strokeRect(cameraCol * miniCellSize, cameraRow * miniCellSize, miniCellSize, miniCellSize);
}


function handleMinimapClick(e) { 
    const rect = worldMinimapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cssWidth = parseFloat(getComputedStyle(worldMinimapCanvas).width);
    const cssHeight = parseFloat(getComputedStyle(worldMinimapCanvas).height);
    const col = Math.floor((x / cssWidth) * worldMapGridSizeX);
    const row = Math.floor((y / cssHeight) * worldMapGridSizeY);

    if (row >= 0 && row < worldMapGridSizeY && col >= 0 && col < worldMapGridSizeX) {
        selectedMinimapViewpoint = { row, col };
        minimapInputRow.value = row;
        minimapInputCol.value = col;
        drawWorldMinimap();
    }
}

function handleConfirmMinimapView() { 
    const targetRow = parseInt(minimapInputRow.value); const targetCol = parseInt(minimapInputCol.value);
    if (isNaN(targetRow) || isNaN(targetCol) || targetRow < 0 || targetRow >= worldMapGridSizeY || targetCol < 0 || targetCol >= worldMapGridSizeX) {
        showMessage(`請輸入有效的小地圖座標。`, "error"); return;
    }
    centerCamera(targetRow, targetCol, 'worldMap');
    hideWorldMinimap();
}

function updateAnalysisCharts() { 
    if (currentMapType !== 'cityMap' || cityMaps[currentCityIndex]?.ownerType !== 'player') return;
    const currentCity = cityMaps[currentCityIndex];
    const buildingCounts = {};
    currentCity.placedBuildings.forEach(b => { buildingCounts[b.name] = (buildingCounts[b.name] || 0) + 1; });
    const armyComposition = {};
    (currentCity.teams || []).forEach(team => {
        team.units.forEach(unit => { if (unit && !unit.inRecruitment) armyComposition[unit.type] = (armyComposition[unit.type] || 0) + 1; });
    });
    const buildingChartCtx = document.getElementById('building-chart')?.getContext('2d');
    if (buildingChartCtx) {
        if (window.buildingChart) window.buildingChart.destroy();
        window.buildingChart = new Chart(buildingChartCtx, {
            type: 'pie',
            data: { labels: Object.keys(buildingCounts), datasets: [{ data: Object.values(buildingCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCF', '#8A2BE2', '#DC143C', '#20B2AA', '#7B68EE', '#FFD700', '#DA70D6'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
        });
    }
    const armyChartCtx = document.getElementById('army-chart')?.getContext('2d');
    if (armyChartCtx) {
        if (window.armyChart) window.armyChart.destroy();
        window.armyChart = new Chart(armyChartCtx, {
            type: 'doughnut',
            data: { labels: Object.keys(armyComposition), datasets: [{ data: Object.values(armyComposition), backgroundColor: Object.values(mapColors.soldier) }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
        });
    }
}
