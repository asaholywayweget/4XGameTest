// pathfinder.js
// 這個模組提供了基於廣度優先搜索 (BFS) 算法的尋路功能。
// 它可以計算兩點之間的最短路徑，以及在給定移動範圍內所有可到達的格子。

/**
 * 尋找從起點到終點的最短路徑。
 * @param {object} start - 起點座標 {row, col}。
 * @param {object} end - 終點座標 {row, col}。
 * @param {number} gridSizeY - 地圖的總行數。
 * @param {number} gridSizeX - 地圖的總列數。
 * @param {Set<string>} obstacles - 一個包含障礙物座標的 Set，格式為 "row,col"。
 * @returns {Array<object>|null} - 返回從起點到終點的路徑（座標物件的陣列），如果找不到路徑則返回 null。
 */
export function findPath(start, end, gridSizeY, gridSizeX, obstacles) {
    // 待訪問的節點佇列
    const queue = [start];
    // 已訪問過的節點，避免重複搜索
    const visited = new Set([`${start.row},${start.col}`]);
    // 儲存每個節點的父節點，用於回溯路徑
    const parentMap = new Map();

    // 定義四個移動方向：上、下、左、右
    const directions = [
        { row: -1, col: 0 }, // 上
        { row: 1, col: 0 },  // 下
        { row: 0, col: -1 }, // 左
        { row: 0, col: 1 }   // 右
    ];

    let pathFound = false;

    // 當佇列中還有節點時，持續搜索
    while (queue.length > 0) {
        const current = queue.shift(); // 取出佇列中的第一個節點

        // 如果當前節點是終點，則停止搜索
        if (current.row === end.row && current.col === end.col) {
            pathFound = true;
            break;
        }

        // 遍歷四個方向
        for (const dir of directions) {
            const next = {
                row: current.row + dir.row,
                col: current.col + dir.col
            };
            const nextKey = `${next.row},${next.col}`;

            // 檢查下一個節點是否有效
            if (isValid(next, gridSizeY, gridSizeX, visited, obstacles)) {
                visited.add(nextKey); // 標記為已訪問
                parentMap.set(nextKey, current); // 記錄父節點
                queue.push(next); // 加入待訪問佇列
            }
        }
    }

    // 如果找到路徑，則從終點回溯以構建路徑
    if (pathFound) {
        const path = [];
        let current = end;
        while (current) {
            path.unshift(current); // 將當前節點加到路徑的最前端
            const currentKey = `${current.row},${current.col}`;
            current = parentMap.get(currentKey);
        }
        return path;
    }

    // 如果佇列為空還沒找到終點，代表沒有路徑
    return null;
}

/**
 * 尋找從起點出發，在給定移動範圍內所有可以到達的格子。
 * @param {object} start - 起點座標 {row, col}。
 * @param {number} moveRange - 最大移動距離。
 * @param {number} gridSizeY - 地圖的總行數。
 * @param {number} gridSizeX - 地圖的總列數。
 * @param {Set<string>} obstacles - 一個包含障礙物座標的 Set，格式為 "row,col"。
 * @returns {Set<string>} - 返回所有可到達格子的座標字串 ("row,col") 的 Set。
 */
export function findAllReachable(start, moveRange, gridSizeY, gridSizeX, obstacles) {
    const reachable = new Set(); // 儲存所有可到達的節點
    const visited = new Set([`${start.row},${start.col}`]); // 已訪問節點
    // 佇列中儲存 {node, distance}
    const queue = [{ node: start, distance: 0 }];

    const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 },
        { row: 0, col: -1 }, { row: 0, col: 1 }
    ];

    while (queue.length > 0) {
        const { node, distance } = queue.shift();

        // 如果當前距離小於等於最大移動範圍，則將此節點加入可到達集合
        if (distance <= moveRange) {
            reachable.add(`${node.row},${node.col}`);
        } else {
            // 因為是 BFS，一旦超出距離，後續的節點也一定超出距離
            continue;
        }

        // 如果還能移動，則探索相鄰節點
        if (distance < moveRange) {
            for (const dir of directions) {
                const next = {
                    row: node.row + dir.row,
                    col: node.col + dir.col
                };

                if (isValid(next, gridSizeY, gridSizeX, visited, obstacles)) {
                    visited.add(`${next.row},${next.col}`);
                    queue.push({ node: next, distance: distance + 1 });
                }
            }
        }
    }
    
    // 起點本身不算是「移動可達」的目標，所以從結果中移除
    reachable.delete(`${start.row},${start.col}`);
    return reachable;
}


/**
 * 輔助函數：檢查一個格子是否有效（在邊界內、未訪問過、不是障礙物）。
 * @param {object} node - 要檢查的節點座標 {row, col}。
 * @param {number} gridSizeY - 地圖的總行數。
 * @param {number} gridSizeX - 地圖的總列數。
 * @param {Set<string>} visited - 已訪問格子的 Set。
 * @param {Set<string>} obstacles - 障礙物格子的 Set。
 * @returns {boolean} - 如果格子有效則返回 true，否則返回 false。
 */
function isValid(node, gridSizeY, gridSizeX, visited, obstacles) {
    const key = `${node.row},${node.col}`;
    // 檢查是否在邊界內
    const inBounds = node.row >= 0 && node.row < gridSizeY && node.col >= 0 && node.col < gridSizeX;
    if (!inBounds) return false;
    // 檢查是否已訪問
    if (visited.has(key)) return false;
    // 檢查是否是障礙物
    if (obstacles.has(key)) return false;

    return true;
}
