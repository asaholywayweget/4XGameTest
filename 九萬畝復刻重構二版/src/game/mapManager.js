// src/game/mapManager.js
// 職責：管理所有與地圖渲染、鏡頭控制和畫布互動相關的邏輯。
// [後台戰鬥 V46]
// - 新增 loadActiveBattles 函式，用於接收當前所有活躍的戰鬥資訊。
// - 新增 drawWorldMapBattleIndicators 函式，用於在世界地圖上繪製交戰圖示 (⚔️)。
// - 修改 performDraw，在繪製世界地圖時呼叫新的交戰圖示繪製函式。

import { getBuildingDataByName } from './buildingData.js';

// --- 私有模組級別狀態 ---
let canvas, ctx, isInitialized = false;
let camera = { x: 0, y: 0, isLocked: false, heightInCells: 17 };
let interaction = { isDragging: false, lastPointerX: 0, lastPointerY: 0, didMove: false };
let currentMap = { data: [], type: 'none', gridSizeX: 0, gridSizeY: 0 };
let externalData = { players: [], placementPreview: null, marches: [] };
let activeBattlesRef = {}; // [新增] 用於儲存活躍戰鬥的參考
const ZOOM_FACTOR = 1.1;
let longPressTimeout = null;
let repositioningBuildingRef = null; 
let peaceTreatyTimerInterval = null;
const CAMERA_BOUNDARY_PADDING_CELLS = 1.5; 
const MIN_VISIBLE_CELLS_Y = 7; 
const MAX_VISIBLE_CELLS_Y = 15; 
let onTileClick = (payload) => console.log('Tile clicked:', payload);
let onMarchClick = (march) => console.log('March clicked:', march);
let onPlacementAction = (action) => console.log('Placement action:', action);
let onCameraMove = () => {};
let showMessageRef;
let getCurrentUserRef;
const dom = {};
let tileInteractionState = { isActive: false, tile: null, gridCoords: null, screenCoords: null, highlightCoords: null };
const RESOURCE_PRODUCTION_RATE = { 'level-1': 2, 'level-2': 4, 'level-3': 6, 'level-4': 10, 'level-5': 14 };
const creaseImages = {};
let creaseEffectSize = 0;
let maskRadius = 0;

function drawRoundedRect(ctx, x, y, width, height, radius) { if (radius < 0) radius = 0; if (radius > width / 2) radius = width / 2; if (radius > height / 2) radius = height / 2; ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y); ctx.arcTo(x + width, y, x + width, y + radius, radius); ctx.lineTo(x + width, y + height - radius); ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); ctx.lineTo(x + radius, y + height); ctx.arcTo(x, y + height, x, y + height - radius, radius); ctx.lineTo(x, y + radius); ctx.arcTo(x, y, x + radius, y, radius); ctx.closePath(); ctx.fill(); }
function createCreaseEffectImage(cornerType, color) { const tempCanvas = document.createElement('canvas'); const tempCtx = tempCanvas.getContext('2d'); tempCanvas.width = creaseEffectSize; tempCanvas.height = creaseEffectSize; tempCtx.fillStyle = color; tempCtx.fillRect(0, 0, creaseEffectSize, creaseEffectSize); tempCtx.globalCompositeOperation = 'destination-out'; tempCtx.fillStyle = 'rgba(0,0,0,1)'; let maskX = 0, maskY = 0; const maskSize = creaseEffectSize * 1.11; if (cornerType === 'top-left') { maskX = 0 - maskSize / 2; maskY = 0 - maskSize / 2; } if (cornerType === 'top-right') { maskX = creaseEffectSize - maskSize / 2; maskY = 0 - maskSize / 2; } if (cornerType === 'bottom-left') { maskX = 0 - maskSize / 2; maskY = creaseEffectSize - maskSize / 2; } if (cornerType === 'bottom-right') { maskX = creaseEffectSize - maskSize / 2; maskY = creaseEffectSize - maskSize / 2; } drawRoundedRect(tempCtx, maskX, maskY, maskSize, maskSize, maskRadius); return tempCanvas; }
function preRenderCreaseImages(cellSize) { const scale = 0.9; creaseEffectSize = cellSize * scale; maskRadius = creaseEffectSize * 0.25; const BASE_GREEN_R = 60, BASE_GREEN_G = 150, BASE_GREEN_B = 60; const structureColors = { 'resource-stone': `rgb(${Math.floor(BASE_GREEN_R * 1.2)}, ${Math.floor(BASE_GREEN_G * 1.2)}, ${Math.floor(BASE_GREEN_B * 1.2)})`, 'resource-wood': `rgb(${Math.floor(150 * 0.6)}, ${Math.floor(255 * 0.6)}, ${Math.floor(120 * 0.6)})`, 'resource-food': `rgb(${Math.floor(BASE_GREEN_R * 0.6)}, ${Math.floor(BASE_GREEN_G * 0.6)}, ${Math.floor(BASE_GREEN_B * 0.6)})` }; for (const type in structureColors) { creaseImages[type] = {}; ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(cornerType => { creaseImages[type][cornerType] = createCreaseEffectImage(cornerType, structureColors[type]); }); } }

function performDraw() {
    if (!isInitialized || !canvas || canvas.width === 0 || canvas.height === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    const virtualCellSize = getVirtualCellSize();
    preRenderCreaseImages(virtualCellSize);

    if (currentMap.type === 'worldMap') {
        drawOrganicWorldMap_V6(virtualCellSize);
        drawTerritoryBorders(virtualCellSize);
        drawWorldMapStructures(virtualCellSize); 
        drawWorldMapMarches(virtualCellSize);
        drawWorldMapGarrisonedUnits(virtualCellSize);
        drawWorldMapBattleIndicators(virtualCellSize); // [新增] 繪製交戰圖示
    } else if (currentMap.type === 'cityMap') {
        drawCityMapTiles(virtualCellSize);
        drawStructures(virtualCellSize); 
        drawBuildings(virtualCellSize); 
        drawDeployedUnits(virtualCellSize);
    } else if (currentMap.type === 'resourceBattleMap') {
        drawResourceBattleMap(virtualCellSize);
        drawStructures(virtualCellSize); 
        drawDeployedUnits(virtualCellSize);
    }

    if (tileInteractionState.isActive && tileInteractionState.highlightCoords && currentMap.type === 'worldMap') {
        drawHighlightBorder(tileInteractionState.highlightCoords, virtualCellSize);
    }
    if (externalData.placementPreview) {
        drawPlacementPreview(virtualCellSize);
    }
    ctx.restore();
}

function drawHighlightBorder(highlightInfo, cellSize) { ctx.strokeStyle = 'yellow'; ctx.lineWidth = 3; ctx.strokeRect(highlightInfo.col * cellSize, highlightInfo.row * cellSize, highlightInfo.size * cellSize, highlightInfo.size * cellSize); }
function drawOrganicWorldMap_V6(cellSize) { const grid = currentMap.data; if (!grid || grid.length === 0) return; const { gridSizeX, gridSizeY } = currentMap; const BASE_GREEN_R = 60, BASE_GREEN_G = 150, BASE_GREEN_B = 60; const bgFactor = 0.75; const backgroundColor = `rgb(${Math.floor(BASE_GREEN_R*bgFactor)}, ${Math.floor(BASE_GREEN_G*bgFactor)}, ${Math.floor(BASE_GREEN_B*bgFactor)})`; ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, gridSizeX * cellSize, gridSizeY * cellSize); const resourceTypeToColorKey = { 'resource-food': 'resource-food', 'resource-wood': 'resource-wood', 'resource-stone': 'resource-stone' }; const structureColors = { 'resource-stone': `rgb(${Math.floor(BASE_GREEN_R * 1.2)}, ${Math.floor(BASE_GREEN_G * 1.2)}, ${Math.floor(BASE_GREEN_B * 1.2)})`, 'resource-wood': `rgb(${Math.floor(150 * 0.6)}, ${Math.floor(255 * 0.6)}, ${Math.floor(120 * 0.6)})`, 'resource-food': `rgb(${Math.floor(BASE_GREEN_R * 0.6)}, ${Math.floor(BASE_GREEN_G * 0.6)}, ${Math.floor(BASE_GREEN_B * 0.6)})` }; const scale = 0.9; const scaledSize = cellSize * scale; const offset = (cellSize - scaledSize) / 2; const getTileData = (r, c) => { if (r < 0 || r >= gridSizeY || c < 0 || c >= gridSizeX) { return null; } return grid[r][c]; }; for (let r = 0; r < gridSizeY; r++) { for (let c = 0; c < gridSizeX; c++) { const tile = getTileData(r, c); if (!tile || !resourceTypeToColorKey[tile.type]) continue; const x = c * cellSize; const y = r * cellSize; const structureColor = structureColors[resourceTypeToColorKey[tile.type]]; ctx.fillStyle = structureColor; drawRoundedRect(ctx, x + offset, y + offset, scaledSize, scaledSize, scaledSize * 0.25); } } for (let r = 0; r < gridSizeY; r++) { for (let c = 0; c < gridSizeX; c++) { const tile = getTileData(r, c); if (!tile || !resourceTypeToColorKey[tile.type] || tile.isOccupiedByCity) continue; const displayX = c * cellSize; const displayY = r * cellSize; const structureColor = structureColors[resourceTypeToColorKey[tile.type]]; ctx.fillStyle = structureColor; const currentTileBaseType = tile.type; const isNeighborSameBaseTypeAndNotCity = (nr, nc) => { const neighborTile = getTileData(nr, nc); return neighborTile && !neighborTile.isOccupiedByCity && neighborTile.type === currentTileBaseType; }; const hasTop = isNeighborSameBaseTypeAndNotCity(r - 1, c); const hasBottom = isNeighborSameBaseTypeAndNotCity(r + 1, c); const hasLeft = isNeighborSameBaseTypeAndNotCity(r, c - 1); const hasRight = isNeighborSameBaseTypeAndNotCity(r, c + 1); if (hasRight) ctx.fillRect(displayX + cellSize - scaledSize / 2, displayY + offset, scaledSize, scaledSize); if (hasLeft) ctx.fillRect(displayX - scaledSize / 2, displayY + offset, scaledSize, scaledSize); if (hasBottom) ctx.fillRect(displayX + offset, displayY + cellSize - scaledSize / 2, scaledSize, scaledSize); if (hasTop) ctx.fillRect(displayX + offset, displayY - scaledSize / 2, scaledSize, scaledSize); if (hasRight && hasBottom && isNeighborSameBaseTypeAndNotCity(r + 1, c + 1)) { ctx.fillRect(displayX + cellSize - scaledSize / 2, displayY + cellSize - scaledSize / 2, scaledSize, scaledSize); } const drawFinalImage = (vertexX, vertexY, cornerType) => { const img = creaseImages[resourceTypeToColorKey[tile.type]]?.[cornerType]; if (img) { ctx.drawImage(img, vertexX - creaseEffectSize / 2, vertexY - creaseEffectSize / 2); } }; const neighborTL = isNeighborSameBaseTypeAndNotCity(r - 1, c - 1); const neighborTR = isNeighborSameBaseTypeAndNotCity(r - 1, c + 1); const neighborBL = isNeighborSameBaseTypeAndNotCity(r + 1, c - 1); const neighborBR = isNeighborSameBaseTypeAndNotCity(r + 1, c + 1); if (hasRight && hasBottom && !neighborBR) drawFinalImage(displayX + cellSize, displayY + cellSize, 'bottom-right'); if (hasLeft && hasBottom && !neighborBL) drawFinalImage(displayX, displayY + cellSize, 'bottom-left'); if (hasRight && hasTop && !neighborTR) drawFinalImage(displayX + cellSize, displayY, 'top-right'); if (hasLeft && hasTop && !neighborTL) drawFinalImage(displayX, displayY, 'top-left'); } } }
function getTileInfo(type) { const TILE_INFO_MAP = { 'city-own': { color: '#4299E1', text: '城' }, 'city-ally': { color: '#48BB78', text: '盟' }, 'city-enemy': { color: '#F56565', text: '敵' }, 'city-neutral': { color: '#ECC94B', text: '中' } }; return TILE_INFO_MAP[type] || { color: '#2D3748', text: '' }; }
function drawCityMapTiles(virtualCellSize) { const cityData = currentMap.data; if (!cityData || !cityData.MAIN_CITY_MIN_ROW) return; const colors = { outerGrass: '#4CAF50', middleEarth: '#8D6E63', innerEarth: '#6D4C41' }; for (let r = 0; r < currentMap.gridSizeY; r++) { for (let c = 0; c < currentMap.gridSizeX; c++) { let color; if (r >= cityData.MAIN_CITY_MIN_ROW && r <= cityData.MAIN_CITY_MAX_ROW && c >= cityData.MAIN_CITY_MIN_COL && c <= cityData.MAIN_CITY_MAX_COL) { color = colors.innerEarth; } else if (r >= cityData.MAIN_CITY_MIN_ROW - 1 && r <= cityData.MAIN_CITY_MAX_ROW + 1 && c >= cityData.MAIN_CITY_MIN_COL - 1 && c <= cityData.MAIN_CITY_MAX_COL + 1) { color = colors.middleEarth; } else { color = colors.outerGrass; } ctx.fillStyle = color; ctx.fillRect(c * virtualCellSize, r * virtualCellSize, virtualCellSize, virtualCellSize); ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5; ctx.strokeRect(c * virtualCellSize, r * virtualCellSize, virtualCellSize, virtualCellSize); } } }
function drawBuildings(virtualCellSize) { const cityData = currentMap.data; if (!cityData.placedBuildings) return; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; cityData.placedBuildings.forEach(building => { if (repositioningBuildingRef && building.name === repositioningBuildingRef.name && building.row === repositioningBuildingRef.row && building.col === repositioningBuildingRef.col) { return; } const buildingStaticData = getBuildingDataByName(building.name); let displayWidth = virtualCellSize; let displayHeight = virtualCellSize; let buildingSize = virtualCellSize * 0.8; let offsetX = (virtualCellSize - buildingSize) / 2; let offsetY = (virtualCellSize - buildingSize) / 2; const x = building.col * virtualCellSize; const y = building.row * virtualCellSize; ctx.fillStyle = buildingStaticData?.color || '#FBC02D'; ctx.fillRect(x + offsetX, y + offsetY, buildingSize, buildingSize); ctx.fillStyle = 'white'; ctx.font = `bold ${virtualCellSize * 0.25}px sans-serif`; ctx.fillText(building.name.substring(0, 2), x + displayWidth / 2, y + displayHeight / 2); }); }

function drawStructures(cellSize) {
    const context = currentMap.data; 
    if (!context || !context.structures) return;
    context.structures.forEach(structure => {
        if (structure.type === 'wall') {
            const wallColor = '#888';
            const gateColor = '#666';
            for (let r = structure.bounds.minY; r <= structure.bounds.maxY; r++) {
                for (let c = structure.bounds.minX; c <= structure.bounds.maxX; c++) {
                    if (r === structure.bounds.minY || r === structure.bounds.maxY || c === structure.bounds.minX || c === structure.bounds.maxX) {
                        const isGate = structure.gates.some(g => g.x === c && g.y === r);
                        ctx.fillStyle = isGate ? gateColor : wallColor;
                        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                    }
                }
            }
            if (structure.currentHp > 0) {
                const hpBarWidth = cellSize * 4; 
                const hpBarHeight = cellSize * 0.2;
                const centerX = (structure.bounds.minX + structure.bounds.maxX + 1) / 2 * cellSize;
                const hpBarX = centerX - (hpBarWidth / 2);
                const hpBarY = structure.bounds.minY * cellSize - hpBarHeight - 5; 
                ctx.fillStyle = '#333'; 
                ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
                const hpPercentage = structure.currentHp / structure.maxHp;
                ctx.fillStyle = '#4ADE80'; 
                ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercentage, hpBarHeight);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            }
        } else if (structure.type === 'flag' || structure.type === 'watchtower') {
            const x = structure.x * cellSize;
            const y = structure.y * cellSize;
            ctx.fillStyle = structure.type === 'flag' ? '#FFFFFF' : '#A0A0A0';
            ctx.fillRect(x + cellSize * 0.2, y + cellSize * 0.2, cellSize * 0.6, cellSize * 0.6);
            ctx.fillStyle = 'black';
            ctx.font = `bold ${cellSize * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(structure.type === 'flag' ? '旗' : '塔', x + cellSize / 2, y + cellSize / 2);

            if (structure.currentHp > 0) {
                const hpBarWidth = cellSize * 1.5;
                const hpBarHeight = cellSize * 0.15;
                const hpBarX = structure.x * cellSize + (cellSize / 2) - (hpBarWidth / 2);
                const hpBarY = structure.y * cellSize - hpBarHeight - 2;
                ctx.fillStyle = '#333';
                ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
                const hpPercentage = structure.currentHp / structure.maxHp;
                ctx.fillStyle = '#4ADE80';
                ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercentage, hpBarHeight);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            }
        }
    });
}

function drawResourceBattleMap(cellSize) { const gridSize = currentMap.gridSizeX; const outerGrassColor = '#4CAF50'; for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { ctx.fillStyle = outerGrassColor; ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize); ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5; ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize); } } }

function drawDeployedUnits(cellSize) {
    const context = currentMap.type === 'resourceBattleMap' ? currentMap.data : currentMap.data;
    if (!context || !context.deployedUnits) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    context.deployedUnits.forEach(unit => {
        const drawGridX = unit.displayX ?? unit.x;
        const drawGridY = unit.displayY ?? unit.y;
        const size = cellSize * 0.7;
        const offset = (cellSize - size) / 2;
        const x = drawGridX * cellSize;
        const y = drawGridY * cellSize;
        const color = unit.ownerId === (getCurrentUserRef()?.uid) ? (unit.color || '#4CAF50') : '#DC2626';
        ctx.fillStyle = color;
        ctx.fillRect(x + offset, y + offset, size, size);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize * 0.2}px sans-serif`;
        ctx.fillText(unit.shortName || '兵', x + cellSize / 2, y + cellSize / 2);
        const hpBarWidth = size;
        const hpBarHeight = cellSize * 0.1;
        const hpBarY = y - hpBarHeight - 2;
        ctx.fillStyle = '#333';
        ctx.fillRect(x + offset, hpBarY, hpBarWidth, hpBarHeight);
        const hpPercentage = unit.currentHp / unit.maxHp;
        ctx.fillStyle = hpPercentage > 0.5 ? '#22C55E' : hpPercentage > 0.2 ? '#FBBF24' : '#EF4444';
        ctx.fillRect(x + offset, hpBarY, hpBarWidth * hpPercentage, hpBarHeight);
    });
}

function drawMarchPath(path, cellSize) {
    if (!path || path.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]); 
    const firstPoint = path[0];
    ctx.moveTo(firstPoint.col * cellSize + cellSize / 2, firstPoint.row * cellSize + cellSize / 2);
    for (let i = 1; i < path.length; i++) {
        const point = path[i];
        ctx.lineTo(point.col * cellSize + cellSize / 2, point.row * cellSize + cellSize / 2);
    }
    ctx.stroke();
    ctx.setLineDash([]); 
}

function drawWorldMapMarches(cellSize) {
    if (!externalData.marches) return;
    const now = Date.now();

    externalData.marches.forEach(march => {
        drawMarchPath(march.path, cellSize);

        if (!march.path || march.path.length < 2) return;

        const pathLength = march.path.length - 1;
        const durationPerSegment = march.totalDuration / pathLength;
        const elapsed = now - march.startTime;
        
        const segmentIndex = Math.floor(elapsed / durationPerSegment);
        
        let currentX, currentY;

        if (segmentIndex >= pathLength) { 
             const finalPos = march.path[pathLength];
             currentX = finalPos.col;
             currentY = finalPos.row;
        } else {
            const segmentProgress = (elapsed % durationPerSegment) / durationPerSegment;
            const startPos = march.path[segmentIndex];
            const endPos = march.path[segmentIndex + 1];
            currentX = startPos.col + (endPos.col - startPos.col) * segmentProgress;
            currentY = startPos.row + (endPos.row - startPos.row) * segmentProgress;
        }
        
        const pixelX = currentX * cellSize + cellSize / 2;
        const pixelY = currentY * cellSize + cellSize / 2;

        march.currentPixelX = pixelX;
        march.currentPixelY = pixelY;

        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, cellSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = `bold ${cellSize * 0.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('行', pixelX, pixelY);
    });
}

function drawWorldMapGarrisonedUnits(cellSize) {
    if (!externalData.players) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    externalData.players.forEach(player => {
        player.cities.forEach(city => {
            city.teams.forEach(team => {
                if (team.status === 'garrisoned_on_tile') {
                    team.units.forEach(unit => {
                        if (unit && unit.worldMapX !== undefined && unit.worldMapY !== undefined) {
                            const pixelX = unit.worldMapX * cellSize;
                            const pixelY = unit.worldMapY * cellSize;
                            const size = cellSize * 0.3; 
                            
                            ctx.fillStyle = unit.ownerId === (getCurrentUserRef()?.uid) ? '#4CAF50' : '#DC2626';
                            ctx.beginPath();
                            ctx.arc(pixelX, pixelY, size / 2, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.fillStyle = 'white';
                            ctx.font = `bold ${size * 0.6}px sans-serif`;
                            ctx.fillText(unit.shortName || '兵', pixelX, pixelY);
                        }
                    });
                }
            });
        });
    });
}

function drawWorldMapStructures(cellSize) {
    const grid = currentMap.data;
    if (!grid) return;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
            if (!tile) continue;
            
            const x = c * cellSize;
            const y = r * cellSize;

            if (tile.isMultiTileCity && tile.mainCityOriginRow === r && tile.mainCityOriginCol === c) {
                const tileInfo = getTileInfo(tile.type);
                ctx.fillStyle = tileInfo.color;
                ctx.fillRect(x, y, cellSize * 2, cellSize * 2);
                ctx.fillStyle = 'white';
                ctx.font = `bold ${cellSize * 0.4}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tileInfo.text, x + cellSize, y + cellSize);
                ctx.strokeStyle = '#4A5568';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize * 2, cellSize * 2);
            } else if (tile.structure?.type === 'watchtower') {
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(x + cellSize * 0.25, y + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);
                ctx.fillStyle = 'white';
                ctx.font = `bold ${cellSize * 0.3}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('哨', x + cellSize / 2, y + cellSize / 2);
            }
        }
    }
}

function drawTerritoryBorders(cellSize) {
    const grid = currentMap.data;
    if (!grid) return;
    const user = getCurrentUserRef();
    if (!user) return;
    const playerId = user.uid;

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)'; 
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
            if (tile && tile.ownerId === playerId) {
                const x = c * cellSize;
                const y = r * cellSize;
                
                if (r === 0 || grid[r - 1][c]?.ownerId !== playerId) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + cellSize, y);
                }
                if (r === grid.length - 1 || grid[r + 1][c]?.ownerId !== playerId) {
                    ctx.moveTo(x, y + cellSize);
                    ctx.lineTo(x + cellSize, y + cellSize);
                }
                if (c === 0 || grid[r][c - 1]?.ownerId !== playerId) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + cellSize);
                }
                if (c === grid[r].length - 1 || grid[r][c + 1]?.ownerId !== playerId) {
                    ctx.moveTo(x + cellSize, y);
                    ctx.lineTo(x + cellSize, y + cellSize);
                }
            }
        }
    }
    ctx.stroke();
}

/**
 * [新增] 在世界地圖上繪製戰鬥指示器
 * @param {number} cellSize - 當前單元格的像素尺寸
 */
function drawWorldMapBattleIndicators(cellSize) {
    if (!activeBattlesRef) return;

    ctx.save();
    ctx.font = `bold ${cellSize * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const battleId in activeBattlesRef) {
        const battle = activeBattlesRef[battleId];
        if (battle.type === 'resourceBattle' && battle.sourceTile) {
            const { row, col } = battle.sourceTile;
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            
            // 畫一個半透明的背景圓圈，讓圖示更突出
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, cellSize * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            // 繪製 emoji 或簡單圖形
            ctx.fillStyle = 'white';
            ctx.fillText('⚔️', x, y);
        }
    }
    ctx.restore();
}

function drawPlacementPreview(virtualCellSize) { const preview = externalData.placementPreview; if (!preview) return; let displayWidth = virtualCellSize; let displayHeight = virtualCellSize; let buildingSize = virtualCellSize * 0.8; let offsetX = (virtualCellSize - buildingSize) / 2; let offsetY = (virtualCellSize - buildingSize) / 2; const x = preview.col * virtualCellSize; const y = preview.row * virtualCellSize; ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = preview.isValid ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)'; ctx.fillRect(x, y, displayWidth, displayHeight); const buildingStaticData = getBuildingDataByName(preview.name); ctx.fillStyle = buildingStaticData?.color || '#FBC02D'; ctx.fillRect(x + offsetX, y + offsetY, buildingSize, buildingSize); ctx.fillStyle = 'white'; ctx.font = `bold ${virtualCellSize * 0.25}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(preview.name.substring(0, 2), x + displayWidth / 2, y + displayHeight / 2); ctx.restore(); const iconSize = virtualCellSize * 0.4; const buttonOffsetFromCorner = virtualCellSize * -0.05; const confirmX = x + displayWidth - iconSize / 2 + buttonOffsetFromCorner; const confirmY = y + displayHeight + iconSize / 2 + buttonOffsetFromCorner; const cancelX = x + iconSize / 2 - buttonOffsetFromCorner; const cancelY = y + displayHeight + iconSize / 2 + buttonOffsetFromCorner; preview.confirmBtn = { x: confirmX, y: confirmY, radius: iconSize/2 }; preview.cancelBtn = { x: cancelX, y: cancelY, radius: iconSize/2 }; ctx.fillStyle = 'rgba(46, 204, 113, 0.9)'; ctx.beginPath(); ctx.arc(confirmX, confirmY, iconSize/2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(231, 76, 60, 0.9)'; ctx.beginPath(); ctx.arc(cancelX, cancelY, iconSize/2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = `bold ${iconSize * 0.6}px sans-serif`; ctx.fillText('✓', confirmX, confirmY); ctx.fillText('×', cancelX, cancelY); }

function getMarchUnderPointer(worldX, worldY, cellSize) {
    if (!externalData.marches) return null;

    for (const march of externalData.marches) {
        if (march.currentPixelX === undefined || march.currentPixelY === undefined) continue;
        
        const marchWorldX = march.currentPixelX;
        const marchWorldY = march.currentPixelY;
        const clickRadius = cellSize * 0.5; // 點擊半徑

        const distance = Math.hypot(worldX - marchWorldX, worldY - marchWorldY);

        if (distance <= clickRadius) {
            return march;
        }
    }
    return null;
}

// --- 互動事件處理 ---
function handleWheel(e) { e.preventDefault(); if (camera.isLocked) return; hideTileInteractionOverlay(); const rect = canvas.getBoundingClientRect(); const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top; const oldCellSize = getVirtualCellSize(); const worldX = (mouseX - camera.x) / oldCellSize; const worldY = (mouseY - camera.y) / oldCellSize; const aspectRatio = canvas.clientWidth / canvas.clientHeight; let currentCellsInViewY = camera.heightInCells; let currentCellsInViewX = currentCellsInViewY * aspectRatio; let newHeightInCells; if (e.deltaY < 0) { if (currentCellsInViewY <= MIN_VISIBLE_CELLS_Y && currentCellsInViewX <= MIN_VISIBLE_CELLS_Y) { return; } newHeightInCells = camera.heightInCells / ZOOM_FACTOR; } else { if (currentCellsInViewY >= MAX_VISIBLE_CELLS_Y && currentCellsInViewX >= MAX_VISIBLE_CELLS_Y) { return; } newHeightInCells = camera.heightInCells * ZOOM_FACTOR; } camera.heightInCells = Math.max(MIN_VISIBLE_CELLS_Y, Math.min(MAX_VISIBLE_CELLS_Y, newHeightInCells)); const newCellSize = getVirtualCellSize(); camera.x = mouseX - worldX * newCellSize; camera.y = mouseY - worldY * newCellSize; enforceCameraBounds(); onCameraMove(); }
function handlePointerDown(e) { if (e.button !== 0) return; interaction.isDragging = true; interaction.didMove = false; interaction.lastPointerX = e.clientX; interaction.lastPointerY = e.clientY; canvas.style.cursor = 'grabbing'; if (tileInteractionState.isActive && !isClickOnTileInteractionElement(e.target)) { hideTileInteractionOverlay(); } longPressTimeout = setTimeout(() => { longPressTimeout = null; if (!interaction.didMove) { const gridCoords = getCanvasToGridCoords(e.clientX, e.clientY); onTileClick({ ...gridCoords, isLongPress: true }); hideTileInteractionOverlay(); } }, 800); }
function handlePointerMove(e) { if (!interaction.isDragging) return; const dx = e.clientX - interaction.lastPointerX; const dy = e.clientY - interaction.lastPointerY; if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { interaction.didMove = true; if (longPressTimeout) { clearTimeout(longPressTimeout); longPressTimeout = null; } } if (camera.isLocked) { const coords = getCanvasToGridCoords(e.clientX, e.clientY); if (externalData.placementPreview && (externalData.placementPreview.row !== coords.row || externalData.placementPreview.col !== coords.col)) { externalData.placementPreview.row = coords.row; externalData.placementPreview.col = coords.col; const city = currentMap.data; const previewBuildingSize = 1; let isValidPlacement = true; for (let i = 0; i < previewBuildingSize; i++) { for (let j = 0; j < previewBuildingSize; j++) { const checkRow = coords.row + i; const checkCol = coords.col + j; const isOccupied = city.placedBuildings.some(b => (b.row === checkRow && b.col === checkCol) && !(repositioningBuildingRef && b.row === repositioningBuildingRef.row && b.col === repositioningBuildingRef.col)); const isInCity = checkRow >= city.MAIN_CITY_MIN_ROW && checkRow <= city.MAIN_CITY_MAX_ROW && checkCol >= city.MAIN_CITY_MIN_COL && checkCol <= city.MAIN_CITY_MAX_COL; if (isOccupied || !isInCity) { isValidPlacement = false; break; } } if (!isValidPlacement) break; } externalData.placementPreview.isValid = isValidPlacement; } } else { camera.x += dx; camera.y += dy; enforceCameraBounds(); onCameraMove(); } interaction.lastPointerX = e.clientX; interaction.lastPointerY = e.clientY; }
function handlePointerUp(e) { 
    if (!interaction.isDragging) return; 
    interaction.isDragging = false; 
    canvas.style.cursor = camera.isLocked ? 'crosshair' : 'grab'; 
    if (longPressTimeout) { clearTimeout(longPressTimeout); longPressTimeout = null; } 
    if (isClickOnTileInteractionElement(e.target)) { if(tileInteractionState.isActive) { return; } } 
    
    if (!interaction.didMove) { 
        const preview = externalData.placementPreview; 
        if (preview) { 
            const clickWorldCoords = getPointerToWorldCoords(e.clientX, e.clientY); 
            const distConfirm = Math.hypot(clickWorldCoords.x - preview.confirmBtn.x, clickWorldCoords.y - preview.confirmBtn.y); 
            if (distConfirm <= preview.confirmBtn.radius) { onPlacementAction('confirm'); return; } 
            const distCancel = Math.hypot(clickWorldCoords.x - preview.cancelBtn.x, clickWorldCoords.y - preview.cancelBtn.y); 
            if (distCancel <= preview.cancelBtn.radius) { onPlacementAction('cancel'); return; } 
        } 
        
        hideTileInteractionOverlay(); 
        
        const worldCoords = getPointerToWorldCoords(e.clientX, e.clientY);
        const clickedMarch = getMarchUnderPointer(worldCoords.x, worldCoords.y, getVirtualCellSize());
        if (clickedMarch) {
            onMarchClick(clickedMarch);
            return;
        }

        const gridCoords = getCanvasToGridCoords(e.clientX, e.clientY); 
        onTileClick(gridCoords); 
    } 
}
function setupEventListeners() { canvas.addEventListener('pointerdown', handlePointerDown); canvas.addEventListener('pointermove', handlePointerMove); canvas.addEventListener('pointerup', handlePointerUp); canvas.addEventListener('pointerleave', handlePointerUp); canvas.addEventListener('wheel', handleWheel); window.addEventListener('keydown', handleGlobalKeyDown); }

// --- 地塊互動彈窗功能 ---
function getDomElements() { dom.tileInteractionOverlay = document.getElementById('tile-interaction-overlay'); dom.tileInteractionContainer = document.getElementById('tile-interaction-container'); dom.tileInfoTop = document.getElementById('tile-info-top'); dom.tileInfoLeft = document.getElementById('tile-info-left'); dom.tileActionsRight = document.getElementById('tile-actions-right'); dom.tileActionEnter = document.getElementById('tile-action-enter'); dom.tileActionOccupy = document.getElementById('tile-action-occupy'); dom.tileActionMarch = document.getElementById('tile-action-march'); dom.tileActionBuild = document.getElementById('tile-action-build'); }
function setupTileInteractionEventListeners() { dom.tileInteractionOverlay.addEventListener('click', (e) => { if (e.target === dom.tileInteractionOverlay) { hideTileInteractionOverlay(); } }); dom.tileActionEnter.addEventListener('click', () => { if (typeof dom.tileActionEnter.onclick === 'function') { dom.tileActionEnter.onclick(); } hideTileInteractionOverlay(); }); dom.tileActionOccupy.addEventListener('click', () => { if (typeof dom.tileActionOccupy.onclick === 'function') { dom.tileActionOccupy.onclick(); } hideTileInteractionOverlay(); }); dom.tileActionMarch.addEventListener('click', () => { if (typeof dom.tileActionMarch.onclick === 'function') { dom.tileActionMarch.onclick(); } hideTileInteractionOverlay(); }); dom.tileActionBuild.addEventListener('click', () => { if (typeof dom.tileActionBuild.onclick === 'function') { dom.tileActionBuild.onclick(); } hideTileInteractionOverlay(); }); }
function handleGlobalKeyDown(e) { if (e.key === 'Escape') { if (externalData.placementPreview) { onPlacementAction('cancel'); } else { hideTileInteractionOverlay(); } } }
function isClickOnTileInteractionElement(target) { return target.closest('.tile-interaction-element') !== null; }
function formatTimeRemaining(timestamp) { const now = Date.now(); const remainingMs = timestamp - now; if (remainingMs <= 0) { return "已結束"; } const totalSeconds = Math.floor(remainingMs / 1000); const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; const pad = (num) => num.toString().padStart(2, '0'); return `${hours}:${pad(minutes)}:${pad(seconds)}`; }
function updatePeaceTreatyDisplay() { if (!tileInteractionState.isActive || !tileInteractionState.tile || !tileInteractionState.tile.isMultiTileCity) { return; } const cityData = tileInteractionState.tile; const peaceTreatyText = cityData.peaceTreatyEndTime && cityData.peaceTreatyEndTime > Date.now() ? `<i class="fas fa-shield-alt text-blue-500 mr-1"></i>免戰: ${formatTimeRemaining(cityData.peaceTreatyEndTime)}` : "免戰: 無"; dom.tileInfoLeft.innerHTML = `生命: ${cityData.hp || 0}/${cityData.maxHp || 0}<br>等級: ${cityData.level || 1}級<br>聯盟: ${cityData.allianceName || '-'}<br>${peaceTreatyText}`; if (cityData.peaceTreatyEndTime && cityData.peaceTreatyEndTime <= Date.now() && peaceTreatyTimerInterval) { clearInterval(peaceTreatyTimerInterval); peaceTreatyTimerInterval = null; } }
function showTileInteractionOverlay(targetTileData, clickedGridCoords) { if (peaceTreatyTimerInterval) { clearInterval(peaceTreatyTimerInterval); peaceTreatyTimerInterval = null; } tileInteractionState.isActive = true; tileInteractionState.tile = targetTileData; tileInteractionState.gridCoords = clickedGridCoords; if (targetTileData.isMultiTileCity) { tileInteractionState.highlightCoords = { row: targetTileData.mainCityOriginRow, col: targetTileData.mainCityOriginCol, size: 2 }; } else { tileInteractionState.highlightCoords = { row: clickedGridCoords.row, col: clickedGridCoords.col, size: 1 }; } const virtualCellSize = getVirtualCellSize(); const highlightedAreaCenterX = (tileInteractionState.highlightCoords.col + tileInteractionState.highlightCoords.size / 2) * virtualCellSize + camera.x; const highlightedAreaCenterY = (tileInteractionState.highlightCoords.row + tileInteractionState.highlightCoords.size / 2) * virtualCellSize + camera.y; tileInteractionState.screenCoords = { x: highlightedAreaCenterX, y: highlightedAreaCenterY }; dom.tileInteractionContainer.style.left = `${highlightedAreaCenterX}px`; dom.tileInteractionContainer.style.top = `${highlightedAreaCenterY}px`; const padding = 16; const halfHighlightedAreaSize = (tileInteractionState.highlightCoords.size * virtualCellSize) / 2; requestAnimationFrame(() => { dom.tileInfoTop.style.top = `calc(-${halfHighlightedAreaSize}px - ${padding}px - ${dom.tileInfoTop.offsetHeight}px)`; dom.tileInfoTop.style.left = '50%'; dom.tileInfoTop.style.transform = 'translateX(-50%)'; dom.tileInfoLeft.style.left = `calc(-${halfHighlightedAreaSize}px - ${padding}px - ${dom.tileInfoLeft.offsetWidth}px)`; dom.tileInfoLeft.style.top = '50%'; dom.tileInfoLeft.style.transform = 'translateY(-50%)'; dom.tileActionsRight.style.left = `${halfHighlightedAreaSize + padding}px`; dom.tileActionsRight.style.top = '50%'; dom.tileActionsRight.style.transform = 'translateY(-50%)'; }); const resourceMap = { 'resource-food': '糧食地', 'resource-wood': '木頭地', 'resource-stone': '石頭地' }; if (targetTileData.isMultiTileCity) { const currentUser = getCurrentUserRef(); const cityStatus = targetTileData.ownerId === currentUser?.uid ? '我方' : targetTileData.type === 'city-ally' ? '盟友' : targetTileData.type === 'city-enemy' ? '敵方' : '中立'; const cityTileName = `${cityStatus}城市`; dom.tileInfoTop.textContent = `${cityTileName} (${targetTileData.mainCityOriginRow},${targetTileData.mainCityOriginCol})`; updatePeaceTreatyDisplay(); if (targetTileData.peaceTreatyEndTime && targetTileData.peaceTreatyEndTime > Date.now()) { peaceTreatyTimerInterval = setInterval(updatePeaceTreatyDisplay, 1000); } } else if (targetTileData.type && targetTileData.type.startsWith('resource-')) { const tileName = resourceMap[targetTileData.type] || '資源地'; dom.tileInfoTop.textContent = `${tileName}${targetTileData.level}級 (${clickedGridCoords.row},${clickedGridCoords.col})`; const production = RESOURCE_PRODUCTION_RATE[`level-${targetTileData.level}`] || 0; dom.tileInfoLeft.innerHTML = `資源: +${production} /小時`; } else { dom.tileInfoTop.textContent = `地塊: (${clickedGridCoords.row}, ${clickedGridCoords.col})`; dom.tileInfoLeft.textContent = `類型: ${targetTileData.type || '空地'}`; } dom.tileActionEnter.classList.add('hidden'); dom.tileActionOccupy.classList.add('hidden'); dom.tileActionMarch.classList.add('hidden'); dom.tileActionBuild.classList.add('hidden'); dom.tileInteractionOverlay.classList.remove('hidden'); mapManager.draw(); }
function hideTileInteractionOverlay() { tileInteractionState.isActive = false; tileInteractionState.tile = null; tileInteractionState.gridCoords = null; tileInteractionState.screenCoords = null; tileInteractionState.highlightCoords = null; dom.tileInteractionOverlay.classList.add('hidden'); mapManager.draw(); if (peaceTreatyTimerInterval) { clearInterval(peaceTreatyTimerInterval); peaceTreatyTimerInterval = null; } }

// --- 輔助函式 ---
function resizeCanvas() { const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.resetTransform(); ctx.scale(dpr, dpr); enforceCameraBounds(); if (tileInteractionState.isActive && tileInteractionState.gridCoords) { requestAnimationFrame(() => { showTileInteractionOverlay(tileInteractionState.tile, tileInteractionState.gridCoords); }); } }
function getVirtualCellSize() { if (!canvas || canvas.clientHeight === 0) return 50; return canvas.clientHeight / camera.heightInCells; }
function getPointerToWorldCoords(pointerX, pointerY) { const rect = canvas.getBoundingClientRect(); const screenX = pointerX - rect.left; const screenY = pointerY - rect.top; const worldX = screenX - camera.x; const worldY = screenY - camera.y; return { x: worldX, y: worldY }; }
function getCanvasToGridCoords(pointerX, pointerY) { const worldCoords = getPointerToWorldCoords(pointerX, pointerY); const virtualCellSize = getVirtualCellSize(); const col = Math.floor(worldCoords.x / virtualCellSize); const row = Math.floor(worldCoords.y / virtualCellSize); return { row, col }; }
function enforceCameraBounds() { const virtualCellSize = getVirtualCellSize(); const mapPixelWidth = currentMap.gridSizeX * virtualCellSize; const mapPixelHeight = currentMap.gridSizeY * virtualCellSize; const paddingPixels = CAMERA_BOUNDARY_PADDING_CELLS * virtualCellSize; let minAllowedX, maxAllowedX; if (mapPixelWidth + 2 * paddingPixels < canvas.clientWidth) { minAllowedX = (canvas.clientWidth - mapPixelWidth) / 2; maxAllowedX = minAllowedX; } else { maxAllowedX = paddingPixels; minAllowedX = canvas.clientWidth - mapPixelWidth - paddingPixels; } camera.x = Math.max(Math.min(camera.x, maxAllowedX), minAllowedX); let minAllowedY, maxAllowedY; if (mapPixelHeight + 2 * paddingPixels < canvas.clientHeight) { minAllowedY = (canvas.clientHeight - mapPixelHeight) / 2; maxAllowedY = minAllowedY; } else { maxAllowedY = paddingPixels; minAllowedY = canvas.clientHeight - mapPixelHeight - paddingPixels; } camera.y = Math.max(Math.min(camera.y, maxAllowedY), minAllowedY); }
    
// --- 公開 API ---
export const mapManager = {
    init: (canvasElement, callbacks) => { 
        if (isInitialized) return; 
        canvas = canvasElement; 
        ctx = canvas.getContext('2d'); 
        if (callbacks) { 
            onTileClick = callbacks.onTileClick || onTileClick; 
            onMarchClick = callbacks.onMarchClick || onMarchClick;
            onPlacementAction = callbacks.onPlacementAction || onPlacementAction; 
            showMessageRef = callbacks.showMessage || showMessageRef; 
            getCurrentUserRef = callbacks.getCurrentUser || getCurrentUserRef; 
            onCameraMove = callbacks.onCameraMove || onCameraMove;
        } 
        getDomElements(); 
        resizeCanvas(); 
        window.addEventListener('resize', resizeCanvas); 
        setupEventListeners(); 
        setupTileInteractionEventListeners(); 
        isInitialized = true; 
        console.log("Map Manager initialized."); 
    },
    loadMapData: (mapData, mapType) => { currentMap.data = mapData; currentMap.type = mapType; if (mapType === 'worldMap') { currentMap.gridSizeX = 60; currentMap.gridSizeY = 60; } else if (mapType === 'cityMap') { currentMap.gridSizeX = 17; currentMap.gridSizeY = 17; } else if (mapType === 'resourceBattleMap') { currentMap.gridSizeX = 11; currentMap.gridSizeY = 11; } const aspectRatio = (canvas?.clientWidth || 1) / (canvas?.clientHeight || 1); const minVisibleCellsConstraint = MIN_VISIBLE_CELLS_Y; const maxVisibleCellsConstraint = MAX_VISIBLE_CELLS_Y; let idealHeightToFitMap = Math.max(currentMap.gridSizeY, currentMap.gridSizeX / aspectRatio); camera.heightInCells = Math.max(minVisibleCellsConstraint, Math.min(maxVisibleCellsConstraint, idealHeightToFitMap)); enforceCameraBounds(); if (isInitialized) { preRenderCreaseImages(getVirtualCellSize()); } },
    loadPlayersData: (players) => { externalData.players = players; },
    loadWorldMapMarches: (marches) => { externalData.marches = marches; },
    loadActiveBattles: (battles) => { activeBattlesRef = battles; }, // [新增]
    centerOn: (row, col) => { const virtualCellSize = getVirtualCellSize(); camera.x = -(col * virtualCellSize) + (canvas.clientWidth / 2) - (virtualCellSize / 2); camera.y = -(row * virtualCellSize) + (canvas.clientHeight / 2) - (virtualCellSize / 2); enforceCameraBounds(); },
    setCameraLock: (locked) => { camera.isLocked = locked; canvas.style.cursor = locked ? 'crosshair' : 'grab'; },
    setPlacementPreview: (previewData) => { externalData.placementPreview = previewData; },
    setRepositioningBuilding: (building) => { repositioningBuildingRef = building; },
    draw: () => { if (!isInitialized) return; performDraw(); },
    showTileInteractionOverlay: showTileInteractionOverlay,
    hideTileInteractionOverlay: hideTileInteractionOverlay,
    getCameraCenter: () => {
        const virtualCellSize = getVirtualCellSize();
        if (virtualCellSize === 0) return { row: 0, col: 0 };
        const centerX = (canvas.clientWidth / 2 - camera.x) / virtualCellSize;
        const centerY = (canvas.clientHeight / 2 - camera.y) / virtualCellSize;
        return { row: Math.floor(centerY), col: Math.floor(centerX) };
    }
};
