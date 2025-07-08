// src/game/buildingData.js
// 職責：提供所有建築的靜態資料。

const defaultBuildingColor = "#FBC02D";

export const buildingsData = [
    { name: "主城", cost: "糧食:0 木頭:0 石頭:0", imageUrl: "https://placehold.co/64x64/A9A9A9/FFFFFF?text=主城", color: "#BDBDBD", buildLimit: 1, description: "您的權力與榮耀的中心。" },
    { name: "兵營", cost: "糧食:0 木頭:0 石頭:0", imageUrl: "https://placehold.co/64x64/E0E0E0/888888?text=兵營", color: defaultBuildingColor, buildLimit: 1, description: "訓練步兵單位的地方。" },
    { name: "研究所", cost: "糧食:50 木頭:30 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=研究所`, color: defaultBuildingColor, buildLimit: 1, description: "研究科技以解鎖新的可能性。" },
    { name: "鐵匠鋪", cost: "糧食:40 木頭:60 石頭:20", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=鐵匠鋪`, color: defaultBuildingColor, buildLimit: 1, description: "鍛造強大的武器與護甲。" },
    { name: "馬廄", cost: "糧食:30 木頭:50 石頭:0", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=馬廄`, color: defaultBuildingColor, buildLimit: 1, description: "訓練騎兵單位的地方。" },
    { name: "工廠", cost: "糧食:70 木頭:70 石頭:50", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=工廠`, color: defaultBuildingColor, buildLimit: 1, description: "製造攻城器械的地方。" },
    { name: "校場", cost: "糧食:20 木頭:40 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=校場`, color: defaultBuildingColor, buildLimit: 1, description: "集結您的軍隊。" },
    { name: "倉庫", cost: "糧食:10 木頭:20 石頭:5", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=倉庫`, color: defaultBuildingColor, buildLimit: 5, description: "保護您的資源不被掠奪。" },
    { name: "糧倉", cost: "糧食:15 木頭:10 石頭:5", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=糧倉`, color: defaultBuildingColor, buildLimit: 5, description: "增加糧食的儲存上限。" },
    { name: "市場", cost: "糧食:30 木頭:30 石頭:10", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=市場`, color: defaultBuildingColor, buildLimit: 1, description: "與其他玩家或系統進行資源交易。" },
    { name: "大使館", cost: "糧食:80 木頭:80 石頭:30", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=大使館`, color: defaultBuildingColor, buildLimit: 1, description: "管理聯盟事務與增援部隊。" },
    { name: "裡亭屬", cost: "糧食:25 木頭:25 石頭:0", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=裡亭屬`, color: defaultBuildingColor, buildLimit: 1, description: "執行政策的地方。" },
    { name: "邊塞營", cost: "糧食:50 木頭:40 石頭:15", imageUrl: `https://placehold.co/64x64/${defaultBuildingColor.substring(1)}/FFFFFF?text=邊塞營`, color: defaultBuildingColor, buildLimit: 1, description: "強化您的城防與守軍。" }
];

/**
 * 根據名稱獲取建築物的靜態資料
 * @param {string} name - 建築物名稱
 * @returns {object | undefined} 建築物資料物件
 */
export function getBuildingDataByName(name) {
    return buildingsData.find(b => b.name === name);
}
