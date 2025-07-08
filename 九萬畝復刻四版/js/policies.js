// policies.js
// This module provides all policy data for the game.

/**
 * Returns an array of all policy data.
 * @returns {Array<Object>} An array of policy objects.
 */
export function getAllPoliciesData() {
    return [
        {
            name: "五穀登峰",
            description: "所有產量增加60",
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=五穀登峰",
            smithLvl: 0 // Default to 0 if not specified
        },
        {
            name: "工業革命",
            description: "建築修建時間減少20%",
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=工業革命",
            smithLvl: 0
        },
        {
            name: "尚武精神",
            description: "招募士兵時間減少10%",
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FFD2D2/C40000?text=尚武精神",
            smithLvl: 0
        },
        {
            name: "齊頭並進",
            description: "建築修建序列提升1",
            researchLvl: 2,
            rating: 2,
            imageUrl: "https://placehold.co/64x64/D3D3D3/666666?text=齊頭並進",
            smithLvl: 0
        },
        {
            name: "火速行軍",
            description: "所有部隊移動速度增加10%",
            researchLvl: 2,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=火速行軍",
            smithLvl: 0
        },
        {
            name: "精進不懈",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=精進不懈",
            smithLvl: 0
        },
        {
            name: "韜光養晦",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FFD2D2/C40000?text=韜光養晦",
            smithLvl: 0
        },
        {
            name: "招賢納士",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 2,
            imageUrl: "https://placehold.co/64x64/D3D3D3/666666?text=招賢納士",
            smithLvl: 0
        },
        {
            name: "多多益善",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=多益善",
            smithLvl: 0
        },
        {
            name: "通商惠工",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=通商惠工",
            smithLvl: 0
        },
        {
            name: "軍國統治",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FFD2D2/C40000?text=軍國統治",
            smithLvl: 0
        },
        {
            name: "烽火支援",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 2,
            imageUrl: "https://placehold.co/64x64/D3D3D3/666666?text=烽火支援",
            smithLvl: 0
        },
        {
            name: "計日程功",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=計日程功",
            smithLvl: 0
        },
        {
            name: "超級賞金",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=超級賞金",
            smithLvl: 0
        },
        {
            name: "鑄火重燃",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FFD2D2/C40000?text=鑄火重燃",
            smithLvl: 0
        },
        {
            name: "糧食多多",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 2,
            imageUrl: "https://placehold.co/64x64/D3D3D3/666666?text=糧食多多",
            smithLvl: 0
        },
        {
            name: "木材多多",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=木材多多",
            smithLvl: 0
        },
        {
            name: "石頭多多",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=石頭多多",
            smithLvl: 0
        },
        {
            name: "守護之心",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FFD2D2/C40000?text=守護之心",
            smithLvl: 0
        },
        {
            name: "農場大咖",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=農場大咖",
            smithLvl: 0
        },
        {
            name: "十場大咖", // Typo in original, assuming it means something like '市場大咖' or similar if it's '十場'
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 5,
            imageUrl: "https://placehold.co/64x64/FCE8B3/967D00?text=十場大咖",
            smithLvl: 0
        },
        {
            name: "牧場大咖",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=牧場大咖",
            smithLvl: 0
        },
        {
            name: "精工巧築",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 3,
            imageUrl: "https://placehold.co/64x64/D3D3D3/666666?text=精工巧築",
            smithLvl: 0
        },
        {
            name: "交能易作",
            description: "政策效果待定", // Original was '#', defaulting to placeholder
            researchLvl: 0,
            rating: 4,
            imageUrl: "https://placehold.co/64x64/D4EDDA/3C763D?text=交能易作",
            smithLvl: 0
        }
    ];
}
