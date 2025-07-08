// src/game/equipmentData.js
// 職責：提供所有裝備的靜態資料。

export function getAllEquipmentsData() {
    return [
        { 
            name: "鐵劍", 
            type: "通用武器",
            imageUrl: "https://placehold.co/64x64/A0A0A0/FFFFFF?text=劍", 
            rating: 1, 
            stats: [
                { name: "攻擊", value: "6 - 15" },
                { name: "生命", value: "10 - 20", note: "(40%機率隨出)" }
            ]
        },
        {
            name: "頭盔",
            type: "通用武器",
            imageUrl: "https://placehold.co/64x64/9CA3AF/FFFFFF?text=盔",
            rating: 1,
            stats: [
                { name: "生命", value: "60 - 130" },
                { name: "攻擊", value: "1 - 2", note: "(40%機率隨出)" }
            ]
        },
        {
            name: "鎖子甲",
            type: "通用武器",
            imageUrl: "https://placehold.co/64x64/71717A/FFFFFF?text=甲",
            rating: 2,
            stats: [
                { name: "生命", value: "20 - 70" },
                { name: "攻擊", value: "1 - 2", note: "(40%機率隨出)" },
            ],
            specialDesc: "受到的傷害減少(1-6)點",
            conditions: {
                research: 3,
                smithy: 3
            }
        },
        {
            name: "回血刀",
            type: "通用武器",
            imageUrl: "https://placehold.co/64x64/22C55E/FFFFFF?text=刀",
            rating: 3,
            stats: [
                { name: "攻擊", value: "1 - 5" },
                { name: "生命", value: "10 - 20", note: "(40%機率隨出)" },
            ],
            specialDesc: "攻擊時,造成有效傷害後恢復(4-10)生命，並有40%機率給5格內生命比最低的1個友方恢復同等生命，無法給器械恢復，攻擊範圍大於2恢復減半",
            conditions: {
                research: 3,
                smithy: 5
            }
        },
        {
            name: "暴擊刀",
            type: "通用武器",
            imageUrl: "https://placehold.co/64x64/EF4444/FFFFFF?text=暴",
            rating: 4,
            stats: [
                { name: "攻擊", value: "2 - 10" },
                { name: "生命", value: "10 - 20", note: "(40%機率隨出)" }
            ],
            specialDesc: "有20-40%機率造成150-180%傷害",
            conditions: {
                research: 3,
                smithy: 5
            }
        },
        {
            name: "長槍",
            type: "專用武器",
            exclusiveFor: "長槍兵",
            imageUrl: "https://placehold.co/64x64/D2691E/FFFFFF?text=槍",
            rating: 5,
            stats: [
                { name: "生命", value: "20 - 40" },
                { name: "攻擊", value: "4 - 12" },
            ],
            specialDesc: "刺擊:向目標方向刺擊的格數+1，且每擊中一個目標獲得15%閃避，持續3回合",
            specialDescPool: {
                title: "從以下效果中隨機3條"
            },
            conditions: {
                research: 17
            }
        }
    ];
}
