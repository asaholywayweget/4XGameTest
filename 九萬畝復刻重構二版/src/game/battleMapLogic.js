// src/game/battleMapLogic.js
// 職責：提供所有與戰鬥地圖相關的底層演算法，例如尋路。

export const battleMapLogic = (() => {
    /**
     * 使用 A* 演算法的變體來尋找從起點到終點的路徑
     * @param {object} start - 起點座標 {x, y}
     * @param {object} end - 終點座標 {x, y}
     * @param {Set<string>} dynamicObstacles - 動態障礙物 (其他單位) 的座標集合，格式為 "x,y"
     * @param {object} context - 戰鬥的上下文，包含地圖尺寸和靜態結構 (如牆)
     * @returns {Array<object> | null} - 路徑座標陣列，或在找不到路徑時回傳 null
     */
    function findPath(start, end, dynamicObstacles, context) {
        const { gridSizeX, gridSizeY } = context;
        const queue = [[start]];
        const visited = new Set([`${start.x},${start.y}`]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const pos = path[path.length - 1];

            if (pos.x === end.x && pos.y === end.y) return path;

            const neighbors = [
                { x: pos.x + 1, y: pos.y }, { x: pos.x - 1, y: pos.y },
                { x: pos.x, y: pos.y + 1 }, { x: pos.x, y: pos.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (neighbor.x < 0 || neighbor.x >= gridSizeX || neighbor.y < 0 || neighbor.y >= gridSizeY || visited.has(key) || dynamicObstacles.has(key)) {
                    continue;
                }
                
                // 檢查是否為牆體 (非城門)
                const isWallTile = context.structures.some(s => 
                    s.type === 'wall' && 
                    neighbor.x >= s.bounds.minX && neighbor.x <= s.bounds.maxX && 
                    neighbor.y >= s.bounds.minY && neighbor.y <= s.bounds.maxY
                );

                if (isWallTile) {
                    const isGate = context.structures.some(s => 
                        s.type === 'wall' && s.gates.some(g => g.x === neighbor.x && g.y === neighbor.y)
                    );
                    if (!isGate) continue; // 如果是牆但不是門，則無法通行
                }

                visited.add(key);
                queue.push([...path, neighbor]);
            }
        }
        return null; // 找不到路徑
    }

    /**
     * 尋找一個點周圍所有可用的部署位置
     * @param {number} startX - 起始點 X 座標
     * @param {number} startY - 起始點 Y 座標
     * @param {object} context - 戰鬥上下文
     * @returns {Array<object>} - 所有可用位置的座標和距離物件陣列
     */
    function findAllPlacementSpots(startX, startY, context) {
        const { gridSizeX, gridSizeY } = context;
        const queue = [{ x: startX, y: startY, distance: 0 }];
        const visited = new Map([[`${startX},${startY}`, 0]]);
        let head = 0;
        
        while(head < queue.length) {
            const { x, y, distance } = queue[head++];
            const neighbors = [{ x: x, y: y - 1 }, { x: x - 1, y: y }, { x: x, y: y + 1 }, { x: x + 1, y: y }];
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (neighbor.x < 0 || neighbor.x >= gridSizeX || neighbor.y < 0 || neighbor.y >= gridSizeY || visited.has(key)) continue;
                
                const isInsideWallArea = context.structures.some(s => s.type === 'wall' && neighbor.x >= s.bounds.minX && neighbor.x <= s.bounds.maxX && neighbor.y >= s.bounds.minY && neighbor.y <= s.bounds.maxY);
                if(isInsideWallArea) continue;

                visited.set(key, distance + 1);
                queue.push({ ...neighbor, distance: distance + 1 });
            }
        }
        
        return Array.from(visited.entries()).map(([key, distance]) => {
            const [x, y] = key.split(',').map(Number);
            return {x, y, distance};
        }).sort((a,b) => a.distance - b.distance);
    }

    // 公開 API
    return { 
        findPath, 
        findAllPlacementSpots 
    };
})();
