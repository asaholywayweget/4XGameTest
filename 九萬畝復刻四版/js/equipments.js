// equipments.js
// This module provides all equipment data for the game.

/**
 * Returns an array of all equipment data.
 * @returns {Array<Object>} An array of equipment objects.
 */
export function getAllEquipmentsData() {
    return [
        {
            name: "鋼鐵戰斧",
            imageUrl: "https://placehold.co/64x64/6B7280/FFFFFF?text=戰斧",
            rating: 4,
            description: "堅固的戰斧，提升攻擊力。",
            researchLvl: 1,
            smithLvl: 1
        },
        {
            name: "堅韌皮甲",
            imageUrl: "https://placehold.co/64x64/9CA3AF/FFFFFF?text=皮甲",
            rating: 3,
            description: "輕便的皮甲，提供基礎防禦。",
            researchLvl: 1,
            smithLvl: 1
        },
        {
            name: "精靈弓",
            imageUrl: "https://placehold.co/64x64/A7D9D3/FFFFFF?text=弓",
            rating: 5,
            description: "傳說中的精靈弓，射程極遠。",
            researchLvl: 2,
            smithLvl: 2
        },
        // You can add more equipment data here
        // {
        //     name: "新裝備",
        //     imageUrl: "...",
        //     rating: 3,
        //     description: "新裝備的描述。",
        //     researchLvl: 1,
        //     smithLvl: 1
        // }
    ];
}
