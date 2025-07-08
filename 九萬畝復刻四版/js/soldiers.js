// soldiers.js
// This module provides all soldier data for the game.

/**
 * Defines the counter relationships and skill display properties for each unit type.
 * 器械 (Siege) units do not have direct counter relationships in this system.
 */
const counterRelationships = {
    "槍兵": {
        counters: "騎兵",      // What this unit type counters
        counteredBy: "弓兵",    // What unit type counters this unit type
        skillIconText: "槍",   // Text for the passive skill's placeholder icon
        skillIconColor: "28A745" // Green color for 槍兵 skills
    },
    "騎兵": {
        counters: "盾兵",
        counteredBy: "槍兵",
        skillIconText: "馬",
        skillIconColor: "8B4513" // Brown color for 騎兵 skills
    },
    "盾兵": {
        counters: "弓兵",
        counteredBy: "騎兵",
        skillIconText: "盾",
        skillIconColor: "1E90FF" // Blue color for 盾兵 skills
    },
    "弓兵": {
        counters: "槍兵",
        counteredBy: "盾兵",
        skillIconText: "弓",
        skillIconColor: "008080" // Teal color for 弓兵 skills
    }
};

/**
 * Generates the passive skill object for a unit based on its type and counter relationships.
 * This skill combines both the "counters" and "countered by" effects.
 * @param {string} unitType - The type of the unit (e.g., "槍兵", "騎兵").
 * @returns {Object|null} The passive skill object, or null if no counter relationship defined.
 */
function generateCounterSkill(unitType) {
    const relationship = counterRelationships[unitType];
    if (!relationship) {
        return null; // If unitType is not in the relationships (e.g., "器械")
    }

    const counteredUnitType = relationship.counters;
    const counteringUnitType = relationship.counteredBy; // The unit type that counters *this* unitType
    const skillIconText = relationship.skillIconText;
    const skillIconColor = relationship.skillIconColor;

    const skillName = `剋制${counteredUnitType}`;
    const description = `克制<strong>${counteredUnitType}</strong><br>攻擊<strong>${counteredUnitType}</strong>時，攻擊力提升<strong>40%</strong>，並無視<strong>20%減傷</strong>。<br>被<strong>${counteringUnitType}</strong>攻擊時，其攻擊力降低<strong>40%</strong>。`;
    const imageUrl = `https://placehold.co/40x40/${skillIconColor}/FFFFFF?text=${skillIconText}`;

    return {
        name: skillName,
        type: "被動技能",
        description: description,
        imageUrl: imageUrl,
        tags: ['counter-skill'] // Add a tag for easy identification
    };
}

// NEW: Generate the passive skill for siege units
function generateSiegeSkill() {
    return {
        name: "攻城",
        type: "被動技能",
        description: `攻擊帶有<strong class="text-amber-700">[建築]</strong>標籤的目標時，造成的傷害變為 <strong>3</strong> 點。`,
        imageUrl: `https://placehold.co/40x40/696969/FFFFFF?text=城`,
        tags: ['siege-skill']
    };
}


/**
 * Returns an array of all soldier data, including their attributes and skills.
 * Automatically adds the appropriate passive skills (counter or siege).
 * @returns {Array<Object>} An array of soldier objects.
 */
export function getAllSoldiersData() {
    const soldiers = [
        {
            name: "長槍兵",
            rating: 3,
            imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=長槍兵",
            level: 1,
            maxHp: 120,
            currentHp: 120,
            attack: { base: 10, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 },
            movementSpeed: 52,
            type: "槍兵",
            researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 10, wood: 5, stone: 0 }, speed: 5, rage: 0, maxRage: 6, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營",
            skills: [ 
                {
                    name: "刺擊",
                    type: "主動技能",
                    rageCost: 6,
                    rageRetentionPercentage: 0,
                    description: `消耗<strong><span class="text-blue-500">6</span>怒氣</strong>施放。<br>` +
                                 `施放後怒氣保留<strong><span class="text-blue-500">0%</span></strong>。<br>` +
                                 `每攻擊<strong>+1怒氣</strong>，每受到傷害<strong>+1怒氣</strong>。<br>` +
                                 `向目標方向刺擊<strong>2</strong>格，對至多<strong>4</strong>個敵方造成攻擊力<strong>100%</strong>的傷害，並恢復已損失生命<strong>30%</strong>的生命。`,
                    imageUrl: "https://placehold.co/40x40/FF4500/FFFFFF?text=擊"
                }
            ]
        },
        {
            name: "長矛兵", rating: 3, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=長矛兵", level: 1, maxHp: 125, currentHp: 125, attack: { base: 12, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 50, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 12, wood: 6, stone: 0 }, speed: 5, rage: 0, maxRage: 7, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []

        },
        {
            name: "長戈兵",
            rating: 3, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=長戈兵", level: 1, maxHp: 130, currentHp: 130, attack: { base: 11, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 55, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 11, wood: 7, stone: 0 }, speed: 5, rage: 0, maxRage: 6, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "陌刀兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=陌刀兵", level: 1, maxHp: 140, currentHp: 140, attack: { base: 15, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 48, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 15, wood: 8, stone: 0 }, speed: 6, rage: 0, maxRage: 8, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "長劍兵",
            rating: 3, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=長劍兵", level: 1, maxHp: 110, currentHp: 110, attack: { base: 13, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 53, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 9, wood: 4, stone: 0 }, speed: 5, rage: 0, maxRage: 6, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "雙槍兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/28A745/FFFFFF?text=雙槍兵", level: 1, maxHp: 135, currentHp: 135, attack: { base: 18, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 56, type: "槍兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 14, wood: 7, stone: 0 }, speed: 6, rage: 0, maxRage: 9, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 7, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "刀盾兵",
            rating: 4,
            imageUrl: "https://placehold.co/64x64/FFA500/FFFFFF?text=刀盾兵",
            level: 1,
            maxHp: 130,
            currentHp: 130,
            attack: { base: 6, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 },
            movementSpeed: 50,
            type: "盾兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 8, wood: 10, stone: 0 }, speed: 5, rage: 0, maxRage: 15, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 8, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營",
            skills: [ 
                {
                    name: "護盾",
                    type: "主動技能",
                    rageCost: 15,
                    rageRetentionPercentage: 0,
                    description: `消耗<strong><span class="text-blue-500">15</span>怒氣</strong>施放。<br>` +
                                 `施放後怒氣保留<strong><span class="text-blue-500">0%</span></strong>。<br>` +
                                 `每攻擊<strong>+1怒氣</strong>，每受到傷害<strong>+1怒氣</strong>。<br>` +
                                 `給<strong>5格</strong>單位內生命比最低的<strong>1</strong>名有方和自身施加一個抵擋<strong>30</strong>傷害的護盾，持續<strong>3</strong>回合。`,
                    imageUrl: "https://placehold.co/40x40/8A2BE2/FFFFFF?text=盾"
                }
            ]
        },
        {
            name: "重盾兵",
            rating: 5, imageUrl: "https://placehold.co/64x64/FFA500/FFFFFF?text=重盾兵", level: 1, maxHp: 180, currentHp: 180, attack: { base: 5, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 40, type: "盾兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 10, wood: 15, stone: 5 }, speed: 4, rage: 0, maxRage: 20, moveRange: 2, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 3, damageReduction: { fixed: 10, percentage: 5 }, actionSpeed: 9, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "有", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "槍盾兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/FFA500/FFFFFF?text=槍盾兵", level: 1, maxHp: 140, currentHp: 140, attack: { base: 8, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 45, type: "盾兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 9, wood: 12, stone: 0 }, speed: 5, rage: 0, maxRage: 16, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 8, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "錘盾兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/FFA500/FFFFFF?text=錘盾兵", level: 1, maxHp: 150, currentHp: 150, attack: { base: 9, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 47, type: "盾兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 10, wood: 13, stone: 0 }, speed: 5, rage: 0, maxRage: 17, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 8, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "劍盾兵",
            rating: 3, imageUrl: "https://placehold.co/64x64/FFA500/FFFFFF?text=劍盾兵", level: 1, maxHp: 120, currentHp: 120, attack: { base: 7, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 52, type: "盾兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 7, wood: 9, stone: 0 }, speed: 5, rage: 0, maxRage: 14, moveRange: 3, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 8, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "長弓兵",
            rating: 3, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=長弓兵", level: 1, maxHp: 90, currentHp: 90, attack: { base: 15, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 45, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 12, wood: 3, stone: 0 }, speed: 6, rage: 0, maxRage: 8, moveRange: 3, attackRange: { base: 3, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "連弩兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=連弩兵", level: 1, maxHp: 95, currentHp: 95, attack: { base: 18, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 42, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 15, wood: 4, stone: 0 }, speed: 7, rage: 0, maxRage: 9, moveRange: 2, attackRange: { base: 4, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "毒弓兵",
            rating: 3, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=毒弓兵", level: 1, maxHp: 85, currentHp: 85, attack: { base: 14, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 47, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 10, wood: 5, stone: 0 }, speed: 6, rage: 0, maxRage: 8, moveRange: 3, attackRange: { base: 3, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "獵人",
            rating: 3, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=獵人", level: 1, maxHp: 100, currentHp: 100, attack: { base: 13, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 50, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 11, wood: 4, stone: 0 }, speed: 6, rage: 0, maxRage: 8, moveRange: 3, attackRange: { base: 2, equipment: 0, skill: 0 }, foodCost: 1, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "強弩兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=強弩兵", level: 1, maxHp: 110, currentHp: 110, attack: { base: 20, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 40, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 14, wood: 6, stone: 0 }, speed: 7, rage: 0, maxRage: 10, moveRange: 2, attackRange: { base: 4, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "火弓兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/008080/FFFFFF?text=火弓兵", level: 1, maxHp: 90, currentHp: 90, attack: { base: 16, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 48, type: "弓兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 13, wood: 5, stone: 0 }, speed: 6, rage: 0, maxRage: 9, moveRange: 3, attackRange: { base: 3, equipment: 0, skill: 0 }, foodCost: 2, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "兵營", skills: []
        },
        {
            name: "劍騎兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=劍騎兵", level: 1, maxHp: 155, currentHp: 155, attack: { base: 13, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 68, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 16, wood: 9, stone: 0 }, speed: 7, rage: 0, maxRage: 11, moveRange: 5, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 3, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "槍騎兵",
            rating: 5, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=槍騎兵", level: 1, maxHp: 160, currentHp: 160, attack: { base: 14, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 72, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 18, wood: 10, stone: 0 }, speed: 8, rage: 0, maxRage: 12, moveRange: 5, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 4, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "大刀騎兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=大刀騎兵", level: 1, maxHp: 165, currentHp: 165, attack: { base: 16, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 65, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 17, wood: 11, stone: 0 }, speed: 7, rage: 0, maxRage: 12, moveRange: 5, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 3, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "重騎兵",
            rating: 5, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=重騎兵", level: 1, maxHp: 200, currentHp: 200, attack: { base: 10, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 60, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 20, wood: 15, stone: 5 }, speed: 6, rage: 0, maxRage: 15, moveRange: 4, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 4, damageReduction: { fixed: 5, percentage: 10 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "有", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "弓騎兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=弓騎兵", level: 1, maxHp: 120, currentHp: 120, attack: { base: 15, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 75, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 14, wood: 8, stone: 0 }, speed: 8, rage: 0, maxRage: 10, moveRange: 5, attackRange: { base: 2, equipment: 0, skill: 0 }, foodCost: 3, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "斧騎兵",
            rating: 4, imageUrl: "https://placehold.co/64x64/8B4513/FFFFFF?text=斧騎兵", level: 1, maxHp: 170, currentHp: 170, attack: { base: 17, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 67, type: "騎兵", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 17, wood: 12, stone: 0 }, speed: 7, rage: 0, maxRage: 12, moveRange: 5, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 3, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "馬廄", skills: []
        },
        {
            name: "衝撞車",
            rating: 2, imageUrl: "https://placehold.co/64x64/696969/FFFFFF?text=衝撞車", level: 1, maxHp: 200, currentHp: 200, attack: { base: 25, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 20, type: "器械", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 0, wood: 20, stone: 15 }, speed: 2, rage: 0, maxRage: 20, moveRange: 1, attackRange: { base: 1, equipment: 0, skill: 0 }, foodCost: 0, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "工廠", skills: []
        },
        {
            name: "投石車",
            rating: 3, imageUrl: "https://placehold.co/64x64/696969/FFFFFF?text=投石車", level: 1, maxHp: 180, currentHp: 180, attack: { base: 30, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 15, type: "器械", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 0, wood: 25, stone: 20 }, speed: 1, rage: 0, maxRage: 25, moveRange: 0, attackRange: { base: 5, equipment: 0, skill: 0 }, foodCost: 0, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "工廠", skills: []
        },
        {
            name: "大弩車",
            rating: 4, imageUrl: "https://placehold.co/64x64/696969/FFFFFF?text=大弩車", level: 1, maxHp: 170, currentHp: 170, attack: { base: 35, fixedBoost: 0, percentageAttackMultiplier: 100, fixedTrueDamage: 0, targetCurrentHpPercentageDamage: 0, targetMaxHpPercentageDamage: 0, targetMaxHpPercentageTrueDamage: 0 }, movementSpeed: 18, type: "器械", researchLvl: 0, smithLvl: 0, trainingTime: 10, resources: { food: 0, wood: 22, stone: 18 }, speed: 1, rage: 0, maxRage: 22, moveRange: 0, attackRange: { base: 4, equipment: 0, skill: 0 }, foodCost: 0, damageReduction: { fixed: 0, percentage: 0 }, actionSpeed: 1, lifesteal: { percentage: 0, fixed: 0 }, hpRegen: { fixed: 0, percentage: 0 }, shield: { current: 0, source: "無" }, evasion: { melee: 0, ranged: 0, all: 0 }, block: "無", parry: 0, rageGainPerAttack: 1, rageGainPerDamageTaken: 1, trainingBuilding: "工廠", skills: []
        }
    ];

    // 為所有士兵動態添加被動技能
    return soldiers.map(soldier => {
        let passiveSkill = null;
        if (soldier.type === '器械') {
            passiveSkill = generateSiegeSkill();
        } else {
            passiveSkill = generateCounterSkill(soldier.type);
        }
        
        if (passiveSkill) {
            // 避免重複添加
            const skillExists = soldier.skills.some(s => s.name === passiveSkill.name);
            if (!skillExists) {
                soldier.skills.unshift(passiveSkill); // 將被動技能加到最前面
            }
        }
        return soldier;
    });
}