// src/game/soldierData.js
// 職責：提供所有士兵單位的靜態資料。
// [同步更新] 確保單位屬性（特別是'器械'類型）與新的戰鬥邏輯匹配。

const counterRelationships = {
    "槍兵": { counters: "騎兵", counteredBy: "弓兵", skillIconText: "槍", skillIconColor: "28A745" },
    "騎兵": { counters: "盾兵", counteredBy: "槍兵", skillIconText: "馬", skillIconColor: "8B4513" },
    "盾兵": { counters: "弓兵", counteredBy: "騎兵", skillIconText: "盾", skillIconColor: "1E90FF" },
    "弓兵": { counters: "槍兵", counteredBy: "盾兵", skillIconText: "弓", skillIconColor: "008080" }
};

function generateCounterSkill(unitType) {
    const relationship = counterRelationships[unitType];
    if (!relationship) return null;
    const { counters, counteredBy, skillIconText, skillIconColor } = relationship;
    return {
        name: `剋制${counters}`,
        type: "被動技能",
        description: `克制<strong>${counters}</strong><br>攻擊<strong>${counters}</strong>時，攻擊力提升<strong>40%</strong>，並無視<strong>20%減傷</strong>。<br>被<strong>${counteredBy}</strong>攻擊時，其攻擊力降低<strong>40%</strong>。`,
        imageUrl: `https://placehold.co/40x40/${skillIconColor}/FFFFFF?text=${skillIconText}`,
        tags: ['counter-skill']
    };
}

function generateSiegeSkill() {
    return {
        name: "攻城",
        type: "被動技能",
        description: `攻擊帶有<strong class="text-amber-700">[建築]</strong>標籤的目標時，造成的傷害變為 <strong>3</strong> 點。`,
        imageUrl: `https://placehold.co/40x40/696969/FFFFFF?text=城`,
        tags: ['siege-skill']
    };
}

const allSoldiers = [
    {
        name: "長槍兵", rating: 3, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=長槍兵", shortName: '長槍', level: 1, maxHp: 120, ap: 10, attackRange: 1, moveRange: 2, movementSpeed: 52, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 5, resources: { food: 10, wood: 5, stone: 0 }, speed: 5, rage: 0, maxRage: 6, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營",
        skills: [{ name: "刺擊", type: "主動技能", rageCost: 6, rageRetentionPercentage: 0, description: `消耗<strong><span class="text-blue-500">6</span>怒氣</strong>施放。<br>向目標方向刺擊<strong>2</strong>格，對至多<strong>4</strong>個敵方造成攻擊力<strong>100%</strong>的傷害，並恢復已損失生命<strong>30%</strong>的生命。`, imageUrl: "https://placehold.co/40x40/FF4500/FFFFFF?text=擊" }]
    },
    {
        name: "騎兵", rating: 4, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=騎兵", shortName: '騎兵', level: 1, maxHp: 150, ap: 12, attackRange: 1, moveRange: 4, movementSpeed: 80, type: "騎兵", researchLvl: 2, smithLvl: 0, trainingTime: 8, resources: { food: 20, wood: 10, stone: 0 }, speed: 8, rage: 0, maxRage: 5, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 9, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 10, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄",
        skills: []
    },
    {
        name: "投石車", rating: 5, imageUrl: "https://placehold.co/64x64/696969/FFFFFF?text=投石車", shortName: '器械', level: 1, maxHp: 80, ap: 25, attackRange: 5, moveRange: 1, movementSpeed: 20, type: "器械", researchLvl: 5, smithLvl: 0, trainingTime: 15, resources: { food: 0, wood: 50, stone: 25 }, speed: 2, rage: 0, maxRage: 0, foodCost: 3, damageReduction: { fixed: 5, percentage: 0 }, actionSpeed: 3, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 0, rageGainPerDamageTaken: 0, trainingBuilding: "工廠",
        skills: []
    }
];


export function getAllSoldiersData() {
    return allSoldiers.map(soldier => {
        const passiveSkill = soldier.type === '器械' ? generateSiegeSkill() : generateCounterSkill(soldier.type);
        const newSoldier = { ...soldier, skills: [...soldier.skills] }; 
        if (passiveSkill && !newSoldier.skills.some(s => s.tags?.includes(passiveSkill.tags[0]))) {
            newSoldier.skills.unshift(passiveSkill);
        }
        return newSoldier;
    });
}

export function getSoldiersForBuilding(buildingName) {
    return getAllSoldiersData().filter(s => s.trainingBuilding === buildingName);
}
