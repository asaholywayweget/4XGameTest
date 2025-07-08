// src/game/illustratedGuide.js
// 職責：管理所有與遊戲圖鑑相關的 UI 互動與內容顯示。
// [修復] 匯出 showSoldierDetail 函式並處理依賴注入，以修復 TypeError。

// 從外部資料檔案引入資料獲取函式
import { getAllSoldiersData } from './soldierData.js';
import { getAllPoliciesData } from './policyData.js';
import { getAllEquipmentsData } from './equipmentData.js';

export const illustratedGuideModule = (() => {
    // --- 內部狀態 ---
    let isInitialized = false;
    const dom = {};
    let dependencies = {}; // [新增] 用於儲存依賴，例如 recruitModule

    // --- 初始化 ---
    function init(deps) { // [修改] 接收依賴
        if (isInitialized) return;
        dependencies = deps || {}; // 儲存傳入的依賴

        // 一次性獲取所有需要的 DOM 元素
        const ids = [
            'illustrated-guide-modal-overlay', 'illustrated-guide-modal-close-button',
            'policy-button', 'soldier-button', 'equipment-button', 'portrait-button',
            'policy-content', 'soldier-content', 'equipment-content', 'portrait-content',
            'policy-detail-modal-overlay', 'policy-detail-close-button', 'policy-detail-image', 'policy-detail-name', 'policy-detail-description',
            'equipment-detail-modal-overlay', 'equipment-detail-close-button', 'equipment-detail-image', 'equipment-detail-name', 'equipment-detail-stats', 'equipment-special-desc-container', 'equipment-special-desc', 'equipment-conditions-container', 'equipment-conditions-list', 'equipment-exclusive-text', 'equipment-exclusive-pool-container', 'equipment-exclusive-pool-title', 'equipment-exclusive-pool-list',
            'soldier-detail-modal-overlay', 'soldier-detail-close-button', 'soldier-detail-image', 'soldier-detail-name', 'soldier-detail-level',
            'soldier-detail-hp', 'soldier-detail-rage', 'soldier-detail-move-range', 'soldier-detail-food-cost', 
            'soldier-detail-move-speed', 'soldier-detail-type', 'soldier-detail-skills', 'no-skills-message',
            'p-soldier-detail-attack-value', 'soldier-detail-attack-value', 
            'p-soldier-detail-attack-range-value', 'soldier-detail-attack-range-value', 
            'p-soldier-detail-damage-reduction-value', 'soldier-detail-damage-reduction-value',
            'p-soldier-detail-lifesteal-value', 'soldier-detail-lifesteal-value', 
            'p-soldier-detail-hp-regen-value', 'soldier-detail-hp-regen-value', 
            'p-soldier-detail-evasion-value', 'soldier-detail-evasion-value',
            'p-soldier-detail-shield', 'soldier-detail-shield', 
            'p-soldier-detail-block', 'soldier-detail-block', 
            'p-soldier-detail-parry', 'soldier-detail-parry',
            'attack-details-modal-overlay', 'attack-details-close-button', 'attack-details-content',
            'attack-range-details-modal-overlay', 'attack-range-details-close-button', 'attack-range-details-content',
            'damage-reduction-details-modal-overlay', 'damage-reduction-details-close-button', 'damage-reduction-details-content',
            'lifesteal-details-modal-overlay', 'lifesteal-details-close-button', 'lifesteal-details-content',
            'hp-regen-details-modal-overlay', 'hp-regen-details-close-button', 'hp-regen-details-content',
            'evasion-details-modal-overlay', 'evasion-details-close-button', 'evasion-details-content',
            'skill-popup-modal-overlay', 'skill-popup-close-button', 'skill-popup-image', 'skill-popup-type',
            'skill-popup-name', 'skill-popup-description',
            'cancel-recruitment-action-block', 'confirm-cancel-recruitment-button'
        ];
        ids.forEach(id => {
            const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
            dom[camelCaseId] = document.getElementById(id);
        });

        setupEventListeners();
        populateAllCatalogs();
        isInitialized = true;
        console.log("Illustrated Guide Module Initialized.");
    }

    // --- 事件監聽 ---
    function setupEventListeners() {
        const bindModalEvents = (overlay, closeButton, hideFunction) => {
            if (overlay) overlay.addEventListener('click', (e) => e.target === overlay && hideFunction());
            if (closeButton) closeButton.addEventListener('click', hideFunction);
        };

        bindModalEvents(dom.illustratedGuideModalOverlay, dom.illustratedGuideModalCloseButton, hide);
        bindModalEvents(dom.soldierDetailModalOverlay, dom.soldierDetailCloseButton, hideSoldierDetail);
        bindModalEvents(dom.skillPopupModalOverlay, dom.skillPopupCloseButton, hideSkillDetailPopup);
        bindModalEvents(dom.attackDetailsModalOverlay, dom.attackDetailsCloseButton, hideAttackDetailPopup);
        bindModalEvents(dom.attackRangeDetailsModalOverlay, dom.attackRangeDetailsCloseButton, hideAttackRangeDetailPopup);
        bindModalEvents(dom.damageReductionDetailsModalOverlay, dom.damageReductionDetailsCloseButton, hideDamageReductionDetailPopup);
        bindModalEvents(dom.lifestealDetailsModalOverlay, dom.lifestealDetailsCloseButton, hideLifestealDetailPopup);
        bindModalEvents(dom.hpRegenDetailsModalOverlay, dom.hpRegenDetailsCloseButton, hideHpRegenDetailPopup);
        bindModalEvents(dom.evasionDetailsModalOverlay, dom.evasionDetailsCloseButton, hideEvasionDetailPopup);
        bindModalEvents(dom.policyDetailModalOverlay, dom.policyDetailCloseButton, hidePolicyDetailModal);
        bindModalEvents(dom.equipmentDetailModalOverlay, dom.equipmentDetailCloseButton, hideEquipmentDetailModal);

        if (dom.policyButton) dom.policyButton.addEventListener('click', () => showTab('policy'));
        if (dom.soldierButton) dom.soldierButton.addEventListener('click', () => showTab('soldier'));
        if (dom.equipmentButton) dom.equipmentButton.addEventListener('click', () => showTab('equipment'));
        if (dom.portraitButton) dom.portraitButton.addEventListener('click', () => showTab('portrait'));
    }

    // --- 通用顯示/隱藏函式 ---
    function showModal(overlayElement) {
        if (!overlayElement) return;
        overlayElement.classList.remove('hidden');
        setTimeout(() => {
            if (overlayElement) overlayElement.classList.add('active');
        }, 10);
    }

    function hideModal(overlayElement) {
        if (!overlayElement) return;
        overlayElement.classList.remove('active');
        setTimeout(() => {
            if (overlayElement) overlayElement.classList.add('hidden');
        }, 300);
    }

    // --- 主圖鑑與頁籤 ---
    function show() { showModal(dom.illustratedGuideModalOverlay); showTab('policy'); }
    function hide() { hideModal(dom.illustratedGuideModalOverlay); }

    function showTab(tabName) {
        const tabs = { policy: dom.policyContent, soldier: dom.soldierContent, equipment: dom.equipmentContent, portrait: dom.portraitContent };
        const buttons = { policy: dom.policyButton, soldier: dom.soldierButton, equipment: dom.equipmentButton, portrait: dom.portraitButton };
        Object.values(tabs).forEach(tab => tab && tab.classList.add('hidden'));
        Object.values(buttons).forEach(button => {
            if (button) {
                button.classList.remove('btn-custom-pressed');
                button.classList.add('btn-custom-normal');
            }
        });
        if (tabs[tabName] && buttons[tabName]) {
            tabs[tabName].classList.remove('hidden');
            buttons[tabName].classList.remove('btn-custom-normal');
            buttons[tabName].classList.add('btn-custom-pressed');
        }
    }

    // --- 內容填充 ---
    function populateAllCatalogs() {
        renderCatalog(dom.soldierContent, getAllSoldiersData(), 'soldier', showSoldierDetail);
        renderCatalog(dom.policyContent, getAllPoliciesData(), 'policy', showPolicyDetailModal);
        renderCatalog(dom.equipmentContent, getAllEquipmentsData(), 'equipment', showEquipmentDetailModal);
        if(dom.portraitContent) dom.portraitContent.innerHTML = '<p class="p-4 text-center">畫像內容待填充</p>';
    }

    function renderCatalog(container, data, type, clickHandler) {
        if (!container) return;
        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-4 gap-x-2 gap-y-1.5 px-0 py-0';
        if (data && data.length > 0) {
            data.forEach(item => {
                const card = createCatalogCard(item);
                card.addEventListener('click', () => clickHandler(item));
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic mt-4">此類別暫無內容。</p>`;
        }
        container.appendChild(grid);
    }

    function createCatalogCard(itemData) {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        let starsHtml = '';
        if (itemData.rating !== undefined) {
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<i class="${i <= itemData.rating ? 'fas' : 'far'} fa-star text-yellow-500"></i>`;
            }
        }
        card.innerHTML = `
            <div class="font-semibold text-center text-base mb-2 w-full truncate">${itemData.name}</div>
            <div class="catalog-card-image-wrapper">
                <img src="${itemData.imageUrl}" alt="${itemData.name}圖片" class="catalog-card-image">
            </div>
            <div class="flex justify-center items-center space-x-0.5 mt-auto">
                ${starsHtml}
            </div>
        `;
        return card;
    }
    
    // --- 詳情彈窗邏輯 ---
    function showSoldierDetail(soldier, context = {}) { populateSoldierDetail(soldier, context); showModal(dom.soldierDetailModalOverlay); }
    function hideSoldierDetail() { hideModal(dom.soldierDetailModalOverlay); }
    function showSkillDetailPopup(skill) { populateSkillDetail(skill); showModal(dom.skillPopupModalOverlay); }
    function hideSkillDetailPopup() { hideModal(dom.skillPopupModalOverlay); }
    function showAttackDetailPopup(soldier) { populateAttackDetail(soldier); showModal(dom.attackDetailsModalOverlay); }
    function hideAttackDetailPopup() { hideModal(dom.attackDetailsModalOverlay); }
    function showAttackRangeDetailPopup(soldier) { populateAttackRangeDetail(soldier); showModal(dom.attackRangeDetailsModalOverlay); }
    function hideAttackRangeDetailPopup() { hideModal(dom.attackRangeDetailsModalOverlay); }
    function showDamageReductionDetailPopup(soldier) { populateDamageReductionDetail(soldier); showModal(dom.damageReductionDetailsModalOverlay); }
    function hideDamageReductionDetailPopup() { hideModal(dom.damageReductionDetailsModalOverlay); }
    function showLifestealDetailPopup(soldier) { populateLifestealDetail(soldier); showModal(dom.lifestealDetailsModalOverlay); }
    function hideLifestealDetailPopup() { hideModal(dom.lifestealDetailsModalOverlay); }
    function showHpRegenDetailPopup(soldier) { populateHpRegenDetail(soldier); showModal(dom.hpRegenDetailsModalOverlay); }
    function hideHpRegenDetailPopup() { hideModal(dom.hpRegenDetailsModalOverlay); }
    function showEvasionDetailPopup(soldier) { populateEvasionDetail(soldier); showModal(dom.evasionDetailsModalOverlay); }
    function hideEvasionDetailPopup() { hideModal(dom.evasionDetailsModalOverlay); }
    function showPolicyDetailModal(policy) { populatePolicyDetail(policy); showModal(dom.policyDetailModalOverlay); }
    function hidePolicyDetailModal() { hideModal(dom.policyDetailModalOverlay); }
    function showEquipmentDetailModal(equipment) { populateEquipmentDetail(equipment); showModal(dom.equipmentDetailModalOverlay); }
    function hideEquipmentDetailModal() { hideModal(dom.equipmentDetailModalOverlay); }

    // --- 詳情內容填充 ---
    function populateSoldierDetail(soldier, context = {}) { 
        if (!dom.soldierDetailModalOverlay) return;
        
        dom.soldierDetailImage.src = soldier.imageUrl;
        dom.soldierDetailName.innerText = soldier.name;
        dom.soldierDetailLevel.innerText = soldier.level;
        dom.soldierDetailType.innerText = soldier.type;
        dom.soldierDetailHp.innerText = `${soldier.maxHp}/${soldier.maxHp}`;
        dom.soldierDetailRage.innerText = `0/${soldier.maxRage}`;
        dom.soldierDetailMoveRange.innerText = `${soldier.moveRange}格`;
        dom.soldierDetailFoodCost.innerText = soldier.foodCost;
        dom.soldierDetailMoveSpeed.innerText = `${soldier.movementSpeed}格/小時`;
        
        const updateStatVisibility = (parentElement, valueElement, value, condition) => {
            if (parentElement) {
                if (valueElement) valueElement.innerText = value;
                parentElement.classList.toggle('hidden', condition);
            }
        };

        updateStatVisibility(dom.pSoldierDetailAttackValue, dom.soldierDetailAttackValue, soldier.ap || 0, false);
        dom.pSoldierDetailAttackValue.onclick = () => showAttackDetailPopup(soldier);

        updateStatVisibility(dom.pSoldierDetailAttackRangeValue, dom.soldierDetailAttackRangeValue, soldier.attackRange.base || soldier.attackRange || 0, false);
        dom.pSoldierDetailAttackRangeValue.onclick = () => showAttackRangeDetailPopup(soldier);

        const drText = `${soldier.damageReduction.fixed || 0}/${soldier.damageReduction.percentage || 0}%`;
        updateStatVisibility(dom.pSoldierDetailDamageReductionValue, dom.soldierDetailDamageReductionValue, drText, !(soldier.damageReduction.fixed || soldier.damageReduction.percentage));
        dom.pSoldierDetailDamageReductionValue.onclick = () => showDamageReductionDetailPopup(soldier);

        const lsText = `${soldier.lifesteal.fixed || 0}/${soldier.lifesteal.percentage || 0}%`;
        updateStatVisibility(dom.pSoldierDetailLifestealValue, dom.soldierDetailLifestealValue, lsText, !(soldier.lifesteal.fixed || soldier.lifesteal.percentage));
        dom.pSoldierDetailLifestealValue.onclick = () => showLifestealDetailPopup(soldier);

        const hrText = `${soldier.hpRegen.fixed || 0}/${soldier.hpRegen.percentage || 0}%`;
        updateStatVisibility(dom.pSoldierDetailHpRegenValue, dom.soldierDetailHpRegenValue, hrText, !(soldier.hpRegen.fixed || soldier.hpRegen.percentage));
        dom.pSoldierDetailHpRegenValue.onclick = () => showHpRegenDetailPopup(soldier);
        
        const evasionText = `${soldier.evasion.all || 0}%`;
        updateStatVisibility(dom.pSoldierDetailEvasionValue, dom.soldierDetailEvasionValue, evasionText, !(soldier.evasion.all || soldier.evasion.melee || soldier.evasion.ranged));
        dom.pSoldierDetailEvasionValue.onclick = () => showEvasionDetailPopup(soldier);

        updateStatVisibility(dom.pSoldierDetailShield, dom.soldierDetailShield, soldier.shield.current || 0, !soldier.shield.current);
        updateStatVisibility(dom.pSoldierDetailBlock, dom.soldierDetailBlock, soldier.block || "無", soldier.block === "無" || !soldier.block);
        updateStatVisibility(dom.pSoldierDetailParry, dom.soldierDetailParry, `${soldier.parry || 0}%`, !soldier.parry);

        dom.soldierDetailSkills.innerHTML = '';
        if (soldier.skills && soldier.skills.length > 0) {
            dom.noSkillsMessage.classList.add('hidden');
            soldier.skills.forEach(skill => {
                const skillDiv = document.createElement('div');
                skillDiv.className = 'flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-150';
                skillDiv.innerHTML = `
                    <img src="${skill.imageUrl}" alt="${skill.name}" class="w-10 h-10 object-contain rounded-full mb-1">
                    <p class="text-xs text-gray-700 truncate w-full text-center">${skill.name}</p>
                `;
                skillDiv.addEventListener('click', () => showSkillDetailPopup(skill));
                dom.soldierDetailSkills.appendChild(skillDiv);
            });
        } else {
            dom.noSkillsMessage.classList.remove('hidden');
        }

        // [修改] 處理取消招募按鈕的邏輯
        const actionBlock = dom.cancelRecruitmentActionBlock;
        const cancelButton = dom.confirmCancelRecruitmentButton;

        if (context.fromRecruitment && actionBlock && cancelButton) {
            actionBlock.classList.remove('hidden');
            const newCancelButton = cancelButton.cloneNode(true); // 避免重複綁定
            cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
            
            newCancelButton.onclick = () => {
                if (dependencies.recruitModule) {
                    dependencies.recruitModule.cancelRecruitment(context.queueIndex, context.buildingName);
                }
                hideSoldierDetail();
            };
            dom.confirmCancelRecruitmentButton = newCancelButton;
        } else if (actionBlock) {
            actionBlock.classList.add('hidden');
        }
    }

    function populateSkillDetail(skill) { dom.skillPopupImage.src = skill.imageUrl; dom.skillPopupType.innerText = skill.type; dom.skillPopupName.innerText = skill.name; dom.skillPopupDescription.innerHTML = skill.description; }
    function populateAttackDetail(soldier) { const attack = soldier.attack; dom.attackDetailsContent.innerHTML = `<p>基礎攻擊: ${attack.base || soldier.ap || 0}</p><p>固定增益: ${attack.fixedBoost || 0}</p><p>百分比增益: ${ (attack.percentageAttackMultiplier || 100) - 100}%</p>`; }
    function populateAttackRangeDetail(soldier) { const range = soldier.attackRange; dom.attackRangeDetailsContent.innerHTML = `<p>基礎範圍: ${range.base || range || 0}</p><p>裝備加成: ${range.equipment || 0}</p><p>技能加成: ${range.skill || 0}</p>`; }
    function populateDamageReductionDetail(soldier) { const dr = soldier.damageReduction; dom.damageReductionDetailsContent.innerHTML = `<p>固定減免: ${dr.fixed || 0}</p><p>百分比減免: ${dr.percentage || 0}%</p>`; }
    function populateLifestealDetail(soldier) { const ls = soldier.lifesteal; dom.lifestealDetailsContent.innerHTML = `<p>固定吸血: ${ls.fixed || 0}</p><p>百分比吸血: ${ls.percentage || 0}%</p>`; }
    function populateHpRegenDetail(soldier) { const hr = soldier.hpRegen; dom.hpRegenDetailsContent.innerHTML = `<p>固定回血: ${hr.fixed || 0}</p><p>百分比回血: ${hr.percentage || 0}%</p>`; }
    function populateEvasionDetail(soldier) { const ev = soldier.evasion; dom.evasionDetailsContent.innerHTML = `<p>近戰閃避: ${ev.melee || 0}%</p><p>遠程閃避: ${ev.ranged || 0}%</p><p>全類型閃避: ${ev.all || 0}%</p>`; }
    function populatePolicyDetail(policy) { dom.policyDetailImage.src = policy.imageUrl; dom.policyDetailName.innerText = policy.name; dom.policyDetailDescription.innerHTML = policy.description; }
    function populateEquipmentDetail(equipment) {
        dom.equipmentDetailImage.src = equipment.imageUrl;
        dom.equipmentDetailName.innerText = equipment.name;
        dom.equipmentDetailStats.innerHTML = ''; 
        dom.equipmentConditionsList.innerHTML = '';
        dom.equipmentExclusivePoolList.innerHTML = '';
        dom.equipmentExclusiveText.classList.add('hidden');
        dom.equipmentSpecialDescContainer.classList.add('hidden');
        dom.equipmentExclusivePoolContainer.classList.add('hidden');
        dom.equipmentConditionsContainer.classList.add('hidden');
        if (equipment.type === '專用武器' && equipment.exclusiveFor) { dom.equipmentExclusiveText.innerText = `${equipment.exclusiveFor}專屬裝備`; dom.equipmentExclusiveText.classList.remove('hidden'); }
        else if (equipment.type === '通用武器') { dom.equipmentExclusiveText.innerText = '通用武器'; dom.equipmentExclusiveText.classList.remove('hidden'); }
        if (equipment.stats && Array.isArray(equipment.stats)) { equipment.stats.forEach(stat => { const statEl = document.createElement('p'); let noteHtml = stat.note ? `<span class="text-gray-500 ml-2">${stat.note}</span>` : ''; statEl.innerHTML = `<span class="font-semibold">${stat.name}:</span> ${stat.value} ${noteHtml}`; dom.equipmentDetailStats.appendChild(statEl); }); }
        if (equipment.specialDescPool) { dom.equipmentExclusivePoolContainer.classList.remove('hidden'); dom.equipmentExclusivePoolTitle.innerText = equipment.specialDescPool.title || "隨機效果池"; const generalEffects = getAllEquipmentsData().filter(eq => eq.type === '通用武器' && eq.specialDesc).map(eq => eq.specialDesc); generalEffects.forEach(effect => { const li = document.createElement('li'); li.innerText = effect; dom.equipmentExclusivePoolList.appendChild(li); }); }
        if (equipment.specialDesc) { dom.equipmentSpecialDesc.innerHTML = equipment.specialDesc; dom.equipmentSpecialDescContainer.classList.remove('hidden'); }
        if (equipment.conditions) { dom.equipmentConditionsContainer.classList.remove('hidden'); if (equipment.conditions.research) { const researchEl = document.createElement('p'); researchEl.innerText = `研究條件: 研究所等級 ${equipment.conditions.research}`; dom.equipmentConditionsList.appendChild(researchEl); } if (equipment.conditions.smithy) { const smithyEl = document.createElement('p'); smithyEl.innerText = `打造條件: 鐵匠鋪等級 ${equipment.conditions.smithy}`; dom.equipmentConditionsList.appendChild(smithyEl); } }
    }

    // --- 公開 API ---
    return {
        init,
        show,
        hide,
        showSoldierDetail // [修改] 匯出函式
    };
})();
