// src/game/policyData.js
// 職責：提供所有政策的靜態資料。

export function getAllPoliciesData() {
    return [
        // 此處為了範例簡潔，只列出一個。您可以將舊 policies.js 中的所有政策資料陣列貼到此處
        {
            name: "五穀登峰",
            description: "所有產量增加60",
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=五穀登峰",
            smithLvl: 0
        },
        // ... 其他政策資料
    ];
}
