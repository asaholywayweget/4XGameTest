// src/game/worldGenerator.js
// 職責：基於種子碼生成整個世界地圖的初始地形、資源和結構。

class SeededRandom {
    constructor(seed) {
        this.seed = this.hashString(seed.toString());
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const result = (this.seed + 233280) % 233280;
        return result / 233280.0;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

function generate(players, gameSeed, currentUserId) {
    console.log(`正在執行基於種子碼的世界生成... 種子: ${gameSeed}`);
    const prng = new SeededRandom(gameSeed);
    const gridSize = 60;
    const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(null));
    const occupiedCoords = new Set();
    const resourceTypes = ['resource-food', 'resource-wood', 'resource-stone'];
    
    resourceTypes.forEach(type => {
        const clusterCount = prng.nextInt(8, 12);
        for (let i = 0; i < clusterCount; i++) {
            let coreR = prng.nextInt(0, gridSize - 1);
            let coreC = prng.nextInt(0, gridSize - 1);
            const clusterSize = prng.nextInt(15, 30);
            for (let j = 0; j < clusterSize; j++) {
                const r = Math.max(0, Math.min(gridSize - 1, coreR + prng.nextInt(-3, 3)));
                const c = Math.max(0, Math.min(gridSize - 1, coreC + prng.nextInt(-3, 3)));
                if (!grid[r][c]) {
                    grid[r][c] = { type: type, level: prng.nextInt(1, 5) };
                }
            }
        }
    });

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!grid[r][c]) {
                const randomType = resourceTypes[prng.nextInt(0, resourceTypes.length - 1)];
                grid[r][c] = { type: randomType, level: prng.nextInt(1, 3), ownerId: null };
            }
        }
    }

    const citySize = 2;
    const findSafeSpawnPoint = () => {
        let attempts = 0;
        while (attempts < 1000) {
            const r = prng.nextInt(0, gridSize - citySize);
            const c = prng.nextInt(0, gridSize - citySize);
            let isSafe = true;
            for (let i = -8; i < citySize + 8; i++) {
                for (let j = -8; j < citySize + 8; j++) {
                    const checkR = r + i;
                    const checkC = c + j;
                    if (checkR < 0 || checkR >= gridSize || checkC < 0 || checkC >= gridSize) continue;
                    if (occupiedCoords.has(`${checkR},${checkC}`)) {
                        isSafe = false;
                        break;
                    }
                    const tileUnder = grid[checkR][checkC];
                    if (tileUnder && resourceTypes.includes(tileUnder.type) && tileUnder.level > 3) {
                        isSafe = false;
                        break;
                    }
                }
                if (!isSafe) break;
            }
            if (isSafe) return { row: r, col: c };
            attempts++;
        }
        return { row: 0, col: 0 };
    };

    players.forEach(player => {
        player.cities.forEach(city => {
            const spawnPoint = findSafeSpawnPoint();
            city.worldMapPosition = spawnPoint;
            let cityType = (player.id === currentUserId) ? 'city-own' : 'city-neutral';
            Object.assign(city, { type: cityType, ownerName: player.name, isMultiTileCity: true, mainCityOriginRow: spawnPoint.row, mainCityOriginCol: spawnPoint.col });

            for (let i = 0; i < citySize; i++) {
                for (let j = 0; j < citySize; j++) {
                    const r = spawnPoint.row + i;
                    const c = spawnPoint.col + j;
                    const originalTile = grid[r][c];
                    let tileObject;
                    if (i === 0 && j === 0) {
                        tileObject = city;
                    } else {
                        tileObject = { ...originalTile, isOccupiedByCity: true, cityOriginRow: spawnPoint.row, cityOriginCol: spawnPoint.col, mainCityTileRef: city };
                    }
                    tileObject.ownerId = player.id;
                    grid[r][c] = tileObject;
                    occupiedCoords.add(`${r},${c}`);
                }
            }
        });
    });
    return grid;
}

export const worldGenerator = {
    generate
};
