// illustratedGuide.js
// This module manages all functionality related to the in-game Illustrated Guide (圖鑑).

import { getAllSoldiersData } from './soldiers.js'; // Import soldier data
import { getAllPoliciesData } from './policies.js'; // New: Import policy data
import { getAllEquipmentsData } from './equipments.js'; // New: Import equipment data

// --- DOM Element References (private to this module) ---
let illustratedGuideModalOverlay, illustratedGuideModalContent, illustratedGuideModalCloseButton;
let policyButton, soldierButton, equipmentButton, portraitButton;
let policyContent, soldierContent, equipmentContent, portraitContent;

// Policy detail modal
let policyDetailModalOverlay, policyDetailModalContent, policyDetailCloseButton;
let policyDetailImage, policyDetailName, policyDetailDescription;

// Soldier detail modal
let soldierDetailModalOverlay, soldierDetailModalContent, soldierDetailCloseButton;
let soldierDetailImage, soldierDetailName, soldierDetailLevel, soldierDetailType;
let soldierDetailHP, soldierDetailRage, soldierDetailMoveRange, soldierDetailFoodCost, soldierDetailMoveSpeed;
let pSoldierDetailAttackValue, soldierDetailAttackValue; // p-tag and span for Attack
let pSoldierDetailAttackRangeValue, soldierDetailAttackRangeValue; // p-tag and span for Attack Range
let pSoldierDetailDamageReductionValue, soldierDetailDamageReductionValue; // p-tag and span for Damage Reduction
let pSoldierDetailLifestealValue, soldierDetailLifestealValue; // p-tag and span for Lifesteal
let pSoldierDetailHpRegenValue, soldierDetailHpRegenValue; // p-tag and span for HP Regen
let pSoldierDetailEvasionValue, soldierDetailEvasionValue; // p-tag and span for Evasion
let pSoldierDetailShield, soldierDetailShield; // p-tag and span for Shield
let pSoldierDetailBlock, soldierDetailBlock; // p-tag and span for Block
let pSoldierDetailParry, soldierDetailParry; // p-tag and span for Parry

let soldierDetailSkills, noSkillsMessage;

// Equipment detail modal
let equipmentDetailModalOverlay, equipmentDetailModalContent, equipmentDetailCloseButton;
let equipmentDetailImage, equipmentDetailName, equipmentDetailDescription;

// New attribute detail popup DOM elements
let attackDetailsModalOverlay, attackDetailsCloseButton, attackDetailsContent;
let attackRangeDetailsModalOverlay, attackRangeDetailsCloseButton, attackRangeDetailsContent;
let damageReductionDetailsModalOverlay, damageReductionDetailsCloseButton, damageReductionDetailsContent;
let lifestealDetailsModalOverlay, lifestealDetailsCloseButton, lifestealDetailsContent;
let hpRegenDetailsModalOverlay, hpRegenDetailsCloseButton, hpRegenDetailsContent;
let evasionDetailsModalOverlay, evasionDetailsCloseButton, evasionDetailsContent;
let skillPopupModalOverlay, skillPopupCloseButton, skillPopupImage, skillPopupType, skillPopupName, skillPopupDescription;

// --- External Dependencies (passed from main.js) ---
let _showMessage = null; // Function to show messages

/**
 * Initializes the Illustrated Guide module.
 * @param {Object} domElements - An object containing references to all necessary DOM elements.
 * @param {Function} showMessageCallback - The showMessage function from main.js.
 */
export function init(domElements, showMessageCallback) {
    _showMessage = showMessageCallback;

    console.log("illustratedGuide.init called."); // Debug log
    console.log("domElements passed to illustratedGuide.init:", domElements); // Debug log

    // Assign DOM elements
    illustratedGuideModalOverlay = domElements.illustratedGuideModalOverlay;
    illustratedGuideModalContent = domElements.illustratedGuideModalContent;
    illustratedGuideModalCloseButton = domElements.illustratedGuideModalCloseButton;
    policyButton = domElements.policyButton;
    soldierButton = domElements.soldierButton;
    equipmentButton = domElements.equipmentButton;
    portraitButton = domElements.portraitButton;
    policyContent = domElements.policyContent;
    soldierContent = domElements.soldierContent;
    equipmentContent = domElements.equipmentContent;
    portraitContent = domElements.portraitContent;

    policyDetailModalOverlay = domElements.policyDetailModalOverlay;
    policyDetailModalContent = domElements.policyDetailModalContent;
    policyDetailCloseButton = domElements.policyDetailCloseButton;
    policyDetailImage = domElements.policyDetailImage;
    policyDetailName = domElements.policyDetailName;
    policyDetailDescription = domElements.policyDetailDescription;

    soldierDetailModalOverlay = domElements.soldierDetailModalOverlay;
    soldierDetailModalContent = domElements.soldierDetailModalContent;
    soldierDetailCloseButton = domElements.soldierDetailCloseButton;
    soldierDetailImage = domElements.soldierDetailImage;
    soldierDetailName = domElements.soldierDetailName;
    soldierDetailLevel = domElements.soldierDetailLevel;
    soldierDetailType = domElements.soldierDetailType;
    soldierDetailHP = domElements.soldierDetailHP;
    soldierDetailRage = domElements.soldierDetailRage;
    soldierDetailMoveRange = domElements.soldierDetailMoveRange;
    soldierDetailFoodCost = domElements.soldierDetailFoodCost;
    soldierDetailMoveSpeed = domElements.soldierDetailMoveSpeed;

    // Corrected assignments for p-tags (parent elements) and their inner spans
    pSoldierDetailAttackValue = domElements.pSoldierDetailAttackValue;
    soldierDetailAttackValue = domElements.soldierDetailAttackValue;
    pSoldierDetailAttackRangeValue = domElements.pSoldierDetailAttackRangeValue;
    soldierDetailAttackRangeValue = domElements.soldierDetailAttackRangeValue;
    pSoldierDetailDamageReductionValue = domElements.pSoldierDetailDamageReductionValue;
    soldierDetailDamageReductionValue = domElements.soldierDetailDamageReductionValue;
    pSoldierDetailLifestealValue = domElements.pSoldierDetailLifestealValue;
    soldierDetailLifestealValue = domElements.soldierDetailLifestealValue;
    pSoldierDetailHpRegenValue = domElements.pSoldierDetailHpRegenValue;
    soldierDetailHpRegenValue = domElements.soldierDetailHpRegenValue;
    pSoldierDetailEvasionValue = domElements.pSoldierDetailEvasionValue;
    soldierDetailEvasionValue = domElements.soldierDetailEvasionValue;

    pSoldierDetailShield = domElements.pSoldierDetailShield;
    soldierDetailShield = domElements.soldierDetailShield;
    pSoldierDetailBlock = domElements.pSoldierDetailBlock;
    soldierDetailBlock = domElements.soldierDetailBlock;
    pSoldierDetailParry = domElements.pSoldierDetailParry; // FIX: This line was the previous typo origin. Ensure it's correct now.
    soldierDetailParry = domElements.soldierDetailParry;


    soldierDetailSkills = domElements.soldierDetailSkills;
    noSkillsMessage = domElements.noSkillsMessage;

    equipmentDetailModalOverlay = domElements.equipmentDetailModalOverlay;
    equipmentDetailModalContent = domElements.equipmentDetailModalContent;
    equipmentDetailCloseButton = domElements.equipmentDetailCloseButton;
    equipmentDetailImage = domElements.equipmentDetailImage;
    equipmentDetailName = domElements.equipmentDetailName;
    equipmentDetailDescription = domElements.equipmentDetailDescription;

    attackDetailsModalOverlay = domElements.attackDetailsModalOverlay;
    attackDetailsCloseButton = domElements.attackDetailsCloseButton;
    attackDetailsContent = domElements.attackDetailsContent;

    attackRangeDetailsModalOverlay = domElements.attackRangeDetailsModalOverlay;
    attackRangeDetailsCloseButton = domElements.attackRangeDetailsCloseButton;
    attackRangeDetailsContent = domElements.attackRangeDetailsContent;

    damageReductionDetailsModalOverlay = domElements.damageReductionDetailsModalOverlay;
    damageReductionDetailsCloseButton = domElements.damageReductionDetailsCloseButton;
    damageReductionDetailsContent = domElements.damageReductionDetailsContent;

    lifestealDetailsModalOverlay = domElements.lifestealDetailsModalOverlay;
    lifestealDetailsCloseButton = domElements.lifestealDetailsCloseButton;
    lifestealDetailsContent = domElements.lifestealDetailsContent;

    hpRegenDetailsModalOverlay = domElements.hpRegenDetailsModalOverlay;
    hpRegenDetailsCloseButton = domElements.hpRegenDetailsCloseButton;
    hpRegenDetailsContent = domElements.hpRegenDetailsContent;

    evasionDetailsModalOverlay = domElements.evasionDetailsModalOverlay;
    evasionDetailsCloseButton = domElements.evasionDetailsCloseButton;
    evasionDetailsContent = domElements.evasionDetailsContent;

    skillPopupModalOverlay = domElements.skillPopupModalOverlay;
    skillPopupCloseButton = domElements.skillPopupCloseButton;
    skillPopupImage = domElements.skillPopupImage;
    skillPopupType = domElements.skillPopupType;
    skillPopupName = domElements.skillPopupName;
    skillPopupDescription = domElements.skillPopupDescription;

    // Debug log after all assignments
    console.log("After assigning DOM elements in illustratedGuide.init. pSoldierDetailAttackValue:", pSoldierDetailAttackValue);
    console.log("After assigning DOM elements in illustratedGuide.init. pSoldierDetailParry:", pSoldierDetailParry);


    setupEventListeners();
    populateAllContent(); // Populate content on init
}

/**
 * Checks if any illustrated guide modal (main guide or any detail popups) is currently visible.
 * This function is exposed to be called by other modules (e.g., main.js for pointer events).
 * @returns {boolean} True if any illustrated guide modal is visible, false otherwise.
 */
export function isAnyIllustratedGuideModalVisible() {
    return (illustratedGuideModalOverlay && !illustratedGuideModalOverlay.classList.contains('hidden')) ||
           (policyDetailModalOverlay && !policyDetailModalOverlay.classList.contains('hidden')) ||
           (soldierDetailModalOverlay && !soldierDetailModalOverlay.classList.contains('hidden')) ||
           (equipmentDetailModalOverlay && !equipmentDetailModalOverlay.classList.contains('hidden')) ||
           (attackDetailsModalOverlay && !attackDetailsModalOverlay.classList.contains('hidden')) ||
           (attackRangeDetailsModalOverlay && !attackRangeDetailsModalOverlay.classList.contains('hidden')) ||
           (damageReductionDetailsModalOverlay && !damageReductionDetailsModalOverlay.classList.contains('hidden')) ||
           (lifestealDetailsModalOverlay && !lifestealDetailsModalOverlay.classList.contains('hidden')) ||
           (hpRegenDetailsModalOverlay && !hpRegenDetailsModalOverlay.classList.contains('hidden')) ||
           (evasionDetailsModalOverlay && !evasionDetailsModalOverlay.classList.contains('hidden')) ||
           (skillPopupModalOverlay && !skillPopupModalOverlay.classList.contains('hidden'));
}


function setupEventListeners() {
    if (illustratedGuideModalOverlay) {
        illustratedGuideModalOverlay.addEventListener('click', (e) => e.target === illustratedGuideModalOverlay && hideIllustratedGuideModal());
    }
    if (illustratedGuideModalCloseButton) {
        illustratedGuideModalCloseButton.addEventListener('click', hideIllustratedGuideModal);
    }
    if (policyButton) {
        policyButton.addEventListener('click', () => showIllustratedGuideTab('policy'));
    }
    if (soldierButton) {
        soldierButton.addEventListener('click', () => showIllustratedGuideTab('soldier'));
    }
    if (equipmentButton) {
        equipmentButton.addEventListener('click', () => showIllustratedGuideTab('equipment'));
    }
    if (portraitButton) {
        portraitButton.addEventListener('click', () => showIllustratedGuideTab('portrait'));
    }

    // Policy detail modal event listeners
    if (policyDetailModalOverlay) {
        policyDetailModalOverlay.addEventListener('click', (e) => e.target === policyDetailModalOverlay && hidePolicyDetailModal());
    }
    if (policyDetailCloseButton) {
        policyDetailCloseButton.addEventListener('click', hidePolicyDetailModal);
    }

    // Soldier detail modal event listeners
    if (soldierDetailCloseButton) {
        soldierDetailCloseButton.addEventListener('click', hideSoldierDetailModal);
    }
    if (soldierDetailModalOverlay) {
        soldierDetailModalOverlay.addEventListener('click', (event) => {
            if (event.target === soldierDetailModalOverlay) {
                hideSoldierDetailModal();
            }
        });
    }

    // Attribute detail popup event listeners
    if (attackDetailsCloseButton) {
        attackDetailsCloseButton.addEventListener('click', hideAttackDetailPopup);
    }
    if (attackDetailsModalOverlay) {
        attackDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === attackDetailsModalOverlay) {
                hideAttackDetailPopup();
            }
        });
    }

    if (attackRangeDetailsCloseButton) {
        attackRangeDetailsCloseButton.addEventListener('click', hideAttackRangeDetailPopup);
    }
    if (attackRangeDetailsModalOverlay) {
        attackRangeDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === attackRangeDetailsModalOverlay) {
                hideAttackRangeDetailPopup();
            }
        });
    }

    if (damageReductionDetailsCloseButton) {
        damageReductionDetailsCloseButton.addEventListener('click', hideDamageReductionDetailPopup);
    }
    if (damageReductionDetailsModalOverlay) {
        damageReductionDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === damageReductionDetailsModalOverlay) {
                hideDamageReductionDetailPopup();
            }
        });
    }

    if (lifestealDetailsCloseButton) {
        lifestealDetailsCloseButton.addEventListener('click', hideLifestealDetailPopup);
    }
    if (lifestealDetailsModalOverlay) {
        lifestealDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === lifestealDetailsModalOverlay) {
                hideLifestealDetailPopup();
            }
        });
    }

    if (hpRegenDetailsCloseButton) {
        hpRegenDetailsCloseButton.addEventListener('click', hideHpRegenDetailPopup);
    }
    if (hpRegenDetailsModalOverlay) {
        hpRegenDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === hpRegenDetailsModalOverlay) {
                hideHpRegenDetailPopup();
            }
        });
    }

    if (evasionDetailsCloseButton) {
        evasionDetailsCloseButton.addEventListener('click', hideEvasionDetailPopup);
    }
    if (evasionDetailsModalOverlay) {
        evasionDetailsModalOverlay.addEventListener('click', (event) => {
            if (event.target === evasionDetailsModalOverlay) {
                hideEvasionDetailPopup();
            }
        });
    }

    // Skill popup event listeners
    if (skillPopupCloseButton) {
        skillPopupCloseButton.addEventListener('click', hideSkillDetailPopup);
    }
    if (skillPopupModalOverlay) {
        skillPopupModalOverlay.addEventListener('click', (event) => {
            if (event.target === skillPopupModalOverlay) {
                hideSkillDetailPopup();
            }
        });
    }

    // Equipment detail modal event listeners
    if (equipmentDetailModalOverlay) {
        equipmentDetailModalOverlay.addEventListener('click', (e) => e.target === equipmentDetailModalOverlay && hideEquipmentDetailModal());
    }
    if (equipmentDetailCloseButton) {
        equipmentDetailCloseButton.addEventListener('click', hideEquipmentDetailModal);
    }
}

/**
 * Populates all illustrated guide content when the module initializes.
 */
function populateAllContent() {
    renderPolicyCatalog(getAllPoliciesData()); // Get policy data from policies.js
    renderSoldierCatalog(getAllSoldiersData()); // Get soldier data from soldiers.js
    renderEquipmentCatalog(getAllEquipmentsData()); // Get equipment data from equipments.js
    populatePortraitContent();
}

export function showIllustratedGuideModal() {
    if (illustratedGuideModalOverlay) {
        illustratedGuideModalOverlay.classList.remove('hidden');
        // Add active class for animation
        setTimeout(() => {
            illustratedGuideModalOverlay.classList.add('active');
        }, 10);
        showIllustratedGuideTab('policy'); // Default to policy tab
    } else {
        _showMessage("圖鑑模態框未初始化。", "error");
    }
}

export function hideIllustratedGuideModal() {
    if (illustratedGuideModalOverlay) {
        illustratedGuideModalOverlay.classList.remove('active');
        setTimeout(() => {
            illustratedGuideModalOverlay.classList.add('hidden');
        }, 300); // Match CSS transition duration
    }
}

export function showIllustratedGuideTab(tabName) {
    document.querySelectorAll('.illustrated-guide-tab').forEach(tab => tab.classList.add('hidden'));

    // Get all illustrated guide navigation buttons by their IDs
    const guideNavButtons = [policyButton, soldierButton, equipmentButton, portraitButton];

    // Reset all navigation buttons to normal state
    guideNavButtons.forEach(button => {
        button.classList.remove('btn-custom-pressed');
        button.classList.add('btn-custom-normal');
    });

    const contentEl = document.getElementById(`${tabName}-content`);
    const buttonEl = document.getElementById(`${tabName}-button`);
    if (contentEl && buttonEl) {
        contentEl.classList.remove('hidden');
        // Set the active button to pressed state
        buttonEl.classList.remove('btn-custom-normal');
        buttonEl.classList.add('btn-custom-pressed');
    } else {
        _showMessage("無法切換圖鑑分頁。", "error");
    }
}

function showPolicyDetailModal(policy) {
    if (!policyDetailModalOverlay || !policyDetailImage || !policyDetailName || !policyDetailDescription) {
        _showMessage("政策詳情模態框DOM元素未完全初始化。", "error");
        return;
    }
    policyDetailImage.src = policy.imageUrl;
    policyDetailImage.onerror = function() {
        this.src = `https://placehold.co/64x64/D3D3D3/666666?text=${policy.name.substring(0,2)}`;
    };
    policyDetailName.innerText = policy.name;

    let descriptionHtml = `<div class='text-gray-600'>${policy.description || '政策效果待定'}</div>`;
    descriptionHtml += `<div class='border-t border-dashed border-gray-400 my-2 w-full'></div>`;
    descriptionHtml += `<div class='text-gray-500 text-sm'>研究條件: 研究所等級 ${policy.researchLvl || 0}</div>`;
    descriptionHtml += `<div class='text-gray-500 text-sm'>打造條件: 鐵匠鋪等級 ${policy.smithLvl || 0}</div>`;

    policyDetailDescription.innerHTML = descriptionHtml;
    policyDetailModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        policyDetailModalOverlay.classList.add('active');
    }, 10);
}

function hidePolicyDetailModal() {
    if (policyDetailModalOverlay) {
        policyDetailModalOverlay.classList.remove('active');
        setTimeout(() => {
            policyDetailModalOverlay.classList.add('hidden');
        }, 300);
    }
}

export function showSoldierDetailModal(soldier) { // Added export
    console.log("showSoldierDetailModal called for soldier:", soldier.name); // Debug log
    console.log("pSoldierDetailAttackValue before checks:", pSoldierDetailAttackValue); // Debug log

    // Check main soldier detail elements
    if (!soldierDetailModalOverlay || !soldierDetailImage || !soldierDetailName || !soldierDetailLevel || !soldierDetailType || !soldierDetailHP || !soldierDetailRage || !soldierDetailMoveRange || !soldierDetailFoodCost || !soldierDetailMoveSpeed) {
        _showMessage("士兵詳情模態框DOM元素未完全初始化。", "error");
        return;
    }

    soldierDetailImage.src = soldier.imageUrl;
    soldierDetailImage.onerror = function() {
        this.src = `https://placehold.co/64x64/D3D3D3/666666?text=${soldier.name.substring(0, 2)}`;
    };
    soldierDetailName.innerText = soldier.name;
    soldierDetailLevel.innerText = soldier.level;
    soldierDetailType.innerText = soldier.type;
    soldierDetailHP.innerText = `${soldier.currentHp}/${soldier.maxHp}`;
    soldierDetailRage.innerText = `${soldier.rage}/${soldier.maxRage}`;
    soldierDetailMoveRange.innerText = `${soldier.moveRange}格`;

    const baseAttack = soldier.attack.base;
    const fixedBoost = soldier.attack.fixedBoost;
    const percentageMultiplier = soldier.attack.percentageAttackMultiplier;
    const fixedTrueDamage = soldier.attack.fixedTrueDamage;
    const targetCurrentHpPercentageDamage = soldier.attack.targetCurrentHpPercentageDamage;
    const targetMaxHpPercentageDamage = soldier.attack.targetMaxHpPercentageDamage;
    const targetMaxHpPercentageTrueDamage = soldier.attack.targetMaxHpPercentageTrueDamage;

    const totalFlatAttack = Math.round((baseAttack + fixedBoost) * (percentageMultiplier / 100) + fixedTrueDamage);
    soldierDetailAttackValue.innerText = totalFlatAttack;
    soldierDetailAttackValue.onclick = () => showAttackDetailPopup(soldier);
    const isAttackHidden = totalFlatAttack === 0 &&
                           targetCurrentHpPercentageDamage === 0 &&
                           targetMaxHpPercentageDamage === 0 &&
                           targetMaxHpPercentageTrueDamage === 0;
    if (pSoldierDetailAttackValue) { // Check if the parent <p> element exists before manipulating classList
        if (isAttackHidden) {
            pSoldierDetailAttackValue.classList.add('hidden');
        } else {
            pSoldierDetailAttackValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailAttackValue is not defined. Cannot hide/show attack value.");
    }

    const baseRange = soldier.attackRange.base;
    const equipmentRange = soldier.attackRange.equipment;
    const skillRange = soldier.attackRange.skill;
    const totalRange = baseRange + equipmentRange + skillRange;
    soldierDetailAttackRangeValue.innerText = totalRange;
    soldierDetailAttackRangeValue.onclick = () => showAttackRangeDetailPopup(soldier);
    if (pSoldierDetailAttackRangeValue) {
        if (totalRange === 0) {
            pSoldierDetailAttackRangeValue.classList.add('hidden');
        } else {
            pSoldierDetailAttackRangeValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailAttackRangeValue is not defined. Cannot hide/show attack range value.");
    }

    const fixedDR = soldier.damageReduction.fixed;
    const percentageDR = soldier.damageReduction.percentage;
    soldierDetailDamageReductionValue.innerText = `${fixedDR}/${percentageDR}%`;
    soldierDetailDamageReductionValue.onclick = () => showDamageReductionDetailPopup(soldier);
    if (pSoldierDetailDamageReductionValue) {
        if (fixedDR === 0 && percentageDR === 0) {
            pSoldierDetailDamageReductionValue.classList.add('hidden');
        } else {
            pSoldierDetailDamageReductionValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailDamageReductionValue is not defined. Cannot hide/show damage reduction value.");
    }

    const fixedLS = soldier.lifesteal.fixed;
    const percentageLS = soldier.lifesteal.percentage;
    soldierDetailLifestealValue.innerText = `${fixedLS}/${percentageLS}%`;
    soldierDetailLifestealValue.onclick = () => showLifestealDetailPopup(soldier);
    if (pSoldierDetailLifestealValue) {
        if (fixedLS === 0 && percentageLS === 0) {
            pSoldierDetailLifestealValue.classList.add('hidden');
        } else {
            pSoldierDetailLifestealValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailLifestealValue is not defined. Cannot hide/show lifesteal value.");
    }

    const fixedHPR = soldier.hpRegen.fixed;
    const percentageHPR = soldier.hpRegen.percentage;
    soldierDetailHpRegenValue.innerText = `${fixedHPR}/${percentageHPR}%`;
    soldierDetailHpRegenValue.onclick = () => showHpRegenDetailPopup(soldier);
    if (pSoldierDetailHpRegenValue) {
        if (fixedHPR === 0 && percentageHPR === 0) {
            pSoldierDetailHpRegenValue.classList.add('hidden');
        } else {
            pSoldierDetailHpRegenValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailHpRegenValue is not defined. Cannot hide/show HP regen value.");
    }

    const evasionMelee = soldier.evasion.melee;
    const evasionRanged = soldier.evasion.ranged;
    const evasionAll = soldier.evasion.all;
    soldierDetailEvasionValue.innerText = `${evasionAll}%`;
    soldierDetailEvasionValue.onclick = () => showEvasionDetailPopup(soldier);
    if (pSoldierDetailEvasionValue) {
        if (evasionMelee === 0 && evasionRanged === 0 && evasionAll === 0) {
            pSoldierDetailEvasionValue.classList.add('hidden');
        } else {
            pSoldierDetailEvasionValue.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailEvasionValue is not defined. Cannot hide/show evasion value.");
    }

    soldierDetailFoodCost.innerText = soldier.foodCost;
    soldierDetailMoveSpeed.innerText = `${soldier.movementSpeed}格/小時`;

    soldierDetailShield.innerText = soldier.shield.current;
    if (pSoldierDetailShield) {
        if (soldier.shield.current === 0) {
            pSoldierDetailShield.classList.add('hidden');
        } else {
            pSoldierDetailShield.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailShield is not defined. Cannot hide/show shield value.");
    }


    const defaultBlockValue = "無";
    soldierDetailBlock.innerText = soldier.block || defaultBlockValue;
    if (pSoldierDetailBlock) {
        if (soldier.block === defaultBlockValue) {
            pSoldierDetailBlock.classList.add('hidden');
        } else {
            pSoldierDetailBlock.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailBlock is not defined. Cannot hide/show block value.");
    }


    const defaultParryValue = 0;
    soldierDetailParry.innerText = `${soldier.parry}%`;
    if (pSoldierDetailParry) {
        if (soldier.parry === defaultParryValue) {
            pSoldierDetailParry.classList.add('hidden');
        } else {
            pSoldierDetailParry.classList.remove('hidden');
        }
    } else {
        console.warn("pSoldierDetailParry is not defined. Cannot hide/show parry value.");
    }

    // Clear old skills
    soldierDetailSkills.innerHTML = '';

    if (soldier.skills && soldier.skills.length > 0) {
        noSkillsMessage.classList.add('hidden');
        soldier.skills.forEach(skill => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-150';

            const skillImg = document.createElement('img');
            skillImg.src = skill.imageUrl;
            skillImg.alt = skill.name;
            skillImg.className = 'w-10 h-10 object-contain rounded-full mb-1';
            skillImg.onerror = function() {
                this.src = `https://placehold.co/40x40/D3D3D3/666666?text=${skill.name.substring(0, 1)}`;
            };

            const skillNameTiny = document.createElement('p');
            skillNameTiny.className = 'text-xs text-gray-700 truncate w-full text-center';
            skillNameTiny.innerText = skill.name;

            skillDiv.appendChild(skillImg);
            skillDiv.appendChild(skillNameTiny);
            soldierDetailSkills.appendChild(skillDiv);

            skillDiv.addEventListener('click', () => showSkillDetailPopup(skill));
        });
    } else {
        noSkillsMessage.classList.remove('hidden');
    }

    soldierDetailModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        soldierDetailModalOverlay.classList.add('active');
    }, 10);
}

function hideSoldierDetailModal() {
    if (soldierDetailModalOverlay) {
        soldierDetailModalOverlay.classList.remove('active');
        setTimeout(() => {
            soldierDetailModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showSkillDetailPopup(skill) {
    if (!skillPopupModalOverlay || !skillPopupImage || !skillPopupType || !skillPopupName || !skillPopupDescription) {
        _showMessage("技能詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    skillPopupImage.src = skill.imageUrl;
    skillPopupImage.onerror = function() {
        this.src = `https://placehold.co/40x40/D3D3D3/666666?text=${skill.name.substring(0, 1)}`;
    };
    skillPopupType.innerHTML = `類型: <span class="font-normal">${skill.type}</span>`;
    skillPopupName.innerText = skill.name;
    skillPopupDescription.innerHTML = skill.description;

    skillPopupModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        skillPopupModalOverlay.classList.add('active');
    }, 10);
}

function hideSkillDetailPopup() {
    if (skillPopupModalOverlay) {
        skillPopupModalOverlay.classList.remove('active');
        setTimeout(() => {
            skillPopupModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showAttackDetailPopup(soldier) {
    if (!attackDetailsModalOverlay || !attackDetailsContent) {
        _showMessage("攻擊詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const attack = soldier.attack;
    let detailsHtml = '';
    detailsHtml += `<p>基本攻擊: <span class="text-gray-700 font-semibold">${attack.base}</span></p>`;
    if (attack.fixedBoost > 0) {
        detailsHtml += `<p>固定增益: <span class="text-green-600 font-semibold">${attack.fixedBoost}</span></p>`;
    }
    if (attack.percentageAttackMultiplier !== 100) {
        const percentageChange = attack.percentageAttackMultiplier - 100;
        detailsHtml += `<p>百分比增益: <span class="text-purple-600 font-semibold">${percentageChange}%</span></p>`;
    }
    if (attack.fixedTrueDamage > 0) {
        detailsHtml += `<p>固定真實傷害: <span class="text-red-600 font-semibold">${attack.fixedTrueDamage}</span></p>`;
    }
    if (attack.targetCurrentHpPercentageDamage > 0) {
        detailsHtml += `<p>目標當前生命%: <span class="text-yellow-600 font-semibold">${attack.targetCurrentHpPercentageDamage}%</span></p>`;
    }
    if (attack.targetMaxHpPercentageDamage > 0) {
        detailsHtml += `<p>目標最大生命%: <span class="text-orange-600 font-semibold">${attack.targetMaxHpPercentageDamage}%</span></p>`;
    }
    if (attack.targetMaxHpPercentageTrueDamage > 0) {
        detailsHtml += `<p>目標最大生命%真實: <span class="text-pink-600 font-semibold">${attack.targetMaxHpPercentageTrueDamage}%</span></p>`;
    }

    const calculatedFlatTotal = Math.round((attack.base + attack.fixedBoost) * (attack.percentageAttackMultiplier / 100) + attack.fixedTrueDamage);
    detailsHtml += `<p class="mt-2 pt-2 border-t border-gray-300">總和 (不含基於生命值): <span class="text-blue-700 font-semibold">${calculatedFlatTotal}</span></p>`;

    attackDetailsContent.innerHTML = detailsHtml;
    attackDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        attackDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideAttackDetailPopup() {
    if (attackDetailsModalOverlay) {
        attackDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            attackDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showAttackRangeDetailPopup(soldier) {
    if (!attackRangeDetailsModalOverlay || !attackRangeDetailsContent) {
        _showMessage("攻擊範圍詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const attackRange = soldier.attackRange;
    let detailsHtml = '';
    detailsHtml += `<p>基本範圍: <span class="text-gray-700 font-semibold">${attackRange.base}</span></p>`;
    if (attackRange.equipment > 0) {
        detailsHtml += `<p>裝備範圍: <span class="text-green-600 font-semibold">${attackRange.equipment}</span></p>`;
    }
    if (attackRange.skill > 0) {
        detailsHtml += `<p>技能範圍: <span class="text-blue-600 font-semibold">${attackRange.skill}</span></p>`;
    }

    const totalRange = attackRange.base + attackRange.equipment + attackRange.skill;
    detailsHtml += `<p class="mt-2 pt-2 border-t border-gray-300">總和: <span class="text-blue-700 font-semibold">${totalRange}</span></p>`;

    attackRangeDetailsContent.innerHTML = detailsHtml;
    attackRangeDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        attackRangeDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideAttackRangeDetailPopup() {
    if (attackRangeDetailsModalOverlay) {
        attackRangeDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            attackRangeDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showDamageReductionDetailPopup(soldier) {
    if (!damageReductionDetailsModalOverlay || !damageReductionDetailsContent) {
        _showMessage("傷害減免詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const damageReduction = soldier.damageReduction;
    let detailsHtml = '';
    detailsHtml += `<p>固定傷害減免: <span class="text-green-600 font-semibold">${damageReduction.fixed}</span></p>`;
    detailsHtml += `<p>百分比傷害減免: <span class="text-purple-600 font-semibold">${damageReduction.percentage}%</span></p>`;

    damageReductionDetailsContent.innerHTML = detailsHtml;
    damageReductionDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        damageReductionDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideDamageReductionDetailPopup() {
    if (damageReductionDetailsModalOverlay) {
        damageReductionDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            damageReductionDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showLifestealDetailPopup(soldier) {
    if (!lifestealDetailsModalOverlay || !lifestealDetailsContent) {
        _showMessage("吸血詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const lifesteal = soldier.lifesteal;
    let detailsHtml = '';
    detailsHtml += `<p>固定吸血: <span class="text-green-600 font-semibold">${lifesteal.fixed}</span></p>`;
    detailsHtml += `<p>百分比吸血: <span class="text-purple-600 font-semibold">${lifesteal.percentage}%</span></p>`;

    lifestealDetailsContent.innerHTML = detailsHtml;
    lifestealDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        lifestealDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideLifestealDetailPopup() {
    if (lifestealDetailsModalOverlay) {
        lifestealDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            lifestealDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showHpRegenDetailPopup(soldier) {
    if (!hpRegenDetailsModalOverlay || !hpRegenDetailsContent) {
        _showMessage("生命恢復詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const hpRegen = soldier.hpRegen;
    let detailsHtml = '';
    detailsHtml += `<p>固定回血: <span class="text-green-600 font-semibold">${hpRegen.fixed}</span></p>`;
    detailsHtml += `<p>百分比回血: <span class="text-purple-600 font-semibold">${hpRegen.percentage}%</span></p>`;

    hpRegenDetailsContent.innerHTML = detailsHtml;
    hpRegenDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        hpRegenDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideHpRegenDetailPopup() {
    if (hpRegenDetailsModalOverlay) {
        hpRegenDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            hpRegenDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showEvasionDetailPopup(soldier) {
    if (!evasionDetailsModalOverlay || !evasionDetailsContent) {
        _showMessage("閃避詳情彈出框DOM元素未完全初始化。", "error");
        return;
    }
    const evasion = soldier.evasion;
    let detailsHtml = '';
    detailsHtml += `<p>近戰閃避: <span class="text-green-600 font-semibold">${evasion.melee}%</span></p>`;
    detailsHtml += `<p>遠程閃避: <span class="text-purple-600 font-semibold">${evasion.ranged}%</span></p>`;
    detailsHtml += `<p>全類型閃避: <span class="text-blue-600 font-semibold">${evasion.all}%</span></p>`;

    evasionDetailsContent.innerHTML = detailsHtml;
    evasionDetailsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        evasionDetailsModalOverlay.classList.add('active');
    }, 10);
}

function hideEvasionDetailPopup() {
    if (evasionDetailsModalOverlay) {
        evasionDetailsModalOverlay.classList.remove('active');
        setTimeout(() => {
            evasionDetailsModalOverlay.classList.add('hidden');
        }, 300);
    }
}

function showEquipmentDetailModal(equipment) {
    if (!equipmentDetailModalOverlay || !equipmentDetailImage || !equipmentDetailName || !equipmentDetailDescription) {
        _showMessage("裝備詳情模態框DOM元素未完全初始化。", "error");
        return;
    }
    equipmentDetailImage.src = equipment.imageUrl;
    equipmentDetailImage.onerror = function() {
        this.src = `https://placehold.co/64x64/D3D3D3/666666?text=${equipment.name.substring(0,2)}`;
    };
    equipmentDetailName.innerText = equipment.name;

    let descriptionHtml = `<div class='text-gray-600'>${equipment.description || '裝備效果待定'}</div>`;
    descriptionHtml += `<div class='border-t border-dashed border-gray-400 my-2 w-full'></div>`;
    descriptionHtml += `<div class='text-gray-500 text-sm'>研究條件: 研究所等級 ${equipment.researchLvl || 0}</div>`;
    descriptionHtml += `<div class='text-gray-500 text-sm'>打造條件: 鐵匠鋪等級 ${equipment.smithLvl || 0}</div>`;

    equipmentDetailDescription.innerHTML = descriptionHtml;
    equipmentDetailModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        equipmentDetailModalOverlay.classList.add('active');
    }, 10);
}

function hideEquipmentDetailModal() {
    if (equipmentDetailModalOverlay) {
        equipmentDetailModalOverlay.classList.remove('active');
        setTimeout(() => {
            equipmentDetailModalOverlay.classList.add('hidden');
        }, 300);
    }
}

/**
 * Creates a catalog card element for an item in the illustrated guide.
 * This function is private to the illustratedGuide module.
 * @param {Object} itemData - The data for the item (policy, soldier, equipment, portrait).
 * @param {string} itemType - The type of item ('policy', 'soldier', 'equipment', 'portrait').
 * @returns {HTMLElement} The created div element.
 */
function createCatalogCard(itemData, itemType) {
    const card = document.createElement('div');
    card.className = 'catalog-card';

    let starsHtml = '';
    if (itemData.rating !== undefined) {
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="${i <= itemData.rating ? 'fas' : 'far'} fa-star text-yellow-500"></i>`;
        }
    }

    const jsonStringifiedItemData = JSON.stringify(itemData).replace(/"/g, '&quot;');

    card.innerHTML = `
        <div class="font-semibold text-center text-base mb-1 w-full truncate">${itemData.name}</div>
        <div class="catalog-card-image-wrapper">
            <img src="${itemData.imageUrl}" alt="${itemData.name}圖片" class="catalog-card-image">
        </div>
        ${itemType === 'soldier' ? `<p class="text-xs text-gray-600 mt-1">等級: ${itemData.level}</p>` : ''}
        ${itemType === 'soldier' ? `<span class="absolute top-1 right-1 bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded-full">${itemData.type}</span>` : ''}
        <div class="flex justify-center items-center space-x-0.5 mt-auto">
            ${starsHtml}
        </div>
    `;

    card.addEventListener('click', () => _handleCatalogItemClick(itemData, itemType));

    return card;
}

/**
 * Handles clicks on catalog items, opening the respective detail modal.
 * This function is private to the illustratedGuide module.
 * @param {Object} itemObject - The data object for the clicked item.
 * @param {string} itemType - The type of item ('policy', 'soldier', 'equipment', 'portrait').
 */
function _handleCatalogItemClick(itemObject, itemType) {
    switch (itemType) {
        case 'policy': showPolicyDetailModal(itemObject); break;
        case 'soldier': showSoldierDetailModal(itemObject); break;
        case 'equipment': showEquipmentDetailModal(itemObject); break;
        case 'portrait': _showMessage(`您點擊了畫像: ${itemObject.name}`, 'info'); break;
        default: _showMessage(`您點擊了: ${itemObject.name}`, 'success'); break;
    }
}


/**
 * Renders the policy catalog based on the provided policy data.
 * @param {Array<Object>} policies - An array of policy objects.
 */
function renderPolicyCatalog(policies) {
    if (!policyContent) {
        console.error("policyContent element not found for rendering policies.");
        return;
    }
    policyContent.innerHTML = '';
    const policiesGrid = document.createElement('div');
    policiesGrid.className = 'grid grid-cols-4 gap-x-2 gap-y-1.5 px-0 py-0';

    policies.forEach(policy => policiesGrid.appendChild(createCatalogCard(policy, 'policy')));
    policyContent.appendChild(policiesGrid);

    const placeholderP = document.createElement('p');
    placeholderP.className = 'text-center text-gray-500 italic mt-4';
    placeholderP.innerText = '更多政策內容將於日後填充。';
    policyContent.appendChild(placeholderP);
}

/**
 * Renders the soldier catalog based on the provided soldier data.
 * @param {Array<Object>} soldiers - An array of soldier objects.
 */
function renderSoldierCatalog(soldiers) {
    if (!soldierContent) {
        console.error("soldierContent element not found for rendering soldiers.");
        return;
    }
    soldierContent.innerHTML = '';
    const soldiersGrid = document.createElement('div');
    soldiersGrid.className = 'grid grid-cols-4 gap-x-2 gap-y-1.5 px-0 py-0';
    soldiers.forEach(soldier => soldiersGrid.appendChild(createCatalogCard(soldier, 'soldier')));
    soldierContent.appendChild(soldiersGrid);
    const placeholderP = document.createElement('p');
    placeholderP.className = 'text-center text-gray-500 italic mt-4';
    placeholderP.innerText = '更多士兵內容將於日後填充。';
    soldierContent.appendChild(placeholderP);
}

/**
 * Renders the equipment catalog based on the provided equipment data.
 * @param {Array<Object>} equipmentItems - An array of equipment objects.
 */
function renderEquipmentCatalog(equipmentItems) {
    if (!equipmentContent) {
        console.error("equipmentContent element not found for rendering equipment.");
        return;
    }
    equipmentContent.innerHTML = '';
    const equipmentGrid = document.createElement('div');
    equipmentGrid.className = 'grid grid-cols-4 gap-x-2 gap-y-1.5 px-0 py-0';

    equipmentItems.forEach(equipment => equipmentGrid.appendChild(createCatalogCard(equipment, 'equipment')));
    equipmentContent.appendChild(equipmentGrid);

    const placeholderP = document.createElement('p');
    placeholderP.className = 'text-center text-gray-500 italic mt-4';
    placeholderP.innerText = '更多裝備內容將於日後填充。';
    equipmentContent.appendChild(placeholderP);
}

function populatePortraitContent() {
    if (!portraitContent) {
        console.error("portraitContent element not found for populating portraits.");
        return;
    }
    portraitContent.innerHTML = '';
    const placeholderP = document.createElement('p');
    placeholderP.className = 'text-center text-gray-500 italic mt-4';
    placeholderP.innerText = '畫像內容暫未設定。敬請期待！';
    portraitContent.appendChild(placeholderP);
}
