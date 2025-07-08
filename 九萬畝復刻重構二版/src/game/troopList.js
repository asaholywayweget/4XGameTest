// src/game/troopList.js
// 職責：管理「我方軍隊列表」的 UI 互動與顯示。
// [行軍邏輯重構 V35 - 可控行軍] 
// - init 函式現在接收 onMarchClick 回呼。
// - 為狀態是 'marching' 的部隊的 UI 元素添加點擊事件監聽器。
// - 點擊後，呼叫 onMarchClick 回呼，觸發主邏輯中的行軍互動面板。

export const troopListModule = (() => {
    // --- 內部狀態 ---
    let isInitialized = false;
    let showMessage;
    let onMarchClick; // [新增]
    const dom = {};

    function init(dependencies) {
        if (isInitialized) return;
        
        showMessage = dependencies.showMessage;
        onMarchClick = dependencies.onMarchClick; // [新增]

        const ids = ['troop-list-modal-overlay', 'troop-modal-close-button', 'troop-list-container', 'no-troops-message', 'troop-list-modal-title'];
        ids.forEach(id => {
            const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
            dom[camelCaseId] = document.getElementById(id);
        });

        setupEventListeners();
        isInitialized = true;
        console.log("Troop List Module initialized (Context-Aware).");
    }

    function setupEventListeners() {
        if (dom.troopListModalOverlay) {
            dom.troopListModalOverlay.addEventListener('click', e => {
                if (e.target === dom.troopListModalOverlay) hide();
            });
        }
        if (dom.troopModalCloseButton) {
            dom.troopModalCloseButton.addEventListener('click', hide);
        }
    }

    function show(context) { 
        if (!dom.troopListModalOverlay || !context) return;
        populateTroopList(context);
        dom.troopListModalOverlay.classList.remove('hidden');
    }

    function hide() {
        if (dom.troopListModalOverlay) {
            dom.troopListModalOverlay.classList.add('hidden');
        }
    }

    function getTeamStatusHtml(team) {
        switch (team.status) {
            case 'garrisoned_in_city':
                return `<span class="text-sm font-semibold text-green-700"><i class="fas fa-shield-alt mr-1"></i> 駐守於: 主城</span>`;
            case 'garrisoned_on_tile':
                return `<span class="text-sm font-semibold text-blue-500"><i class="fas fa-flag mr-1"></i> 駐守於: 地塊 (${team.location.row}, ${team.location.col})</span>`;
            case 'marching':
            case 'returning':
                const icon = team.status === 'returning' ? 'fa-undo-alt' : 'fa-shoe-prints';
                const color = team.status === 'returning' ? 'text-purple-500' : 'text-orange-500';
                return `<span class="text-sm font-semibold ${color}"><i class="fas ${icon} mr-1"></i> ${team.marchTarget.name}</span>`;
            case 'in_battle':
                return `<span class="text-sm font-semibold text-red-700"><i class="fas fa-swords mr-1"></i> 交戰中於: 地塊 (${team.location.row}, ${team.location.col})</span>`;
            default:
                return `<span class="text-sm font-semibold text-gray-500"><i class="fas fa-question-circle mr-1"></i> 狀態未知</span>`;
        }
    }

    function populateTroopList(context) {
        if (!dom.troopListContainer || !dom.noTroopsMessage) return;

        dom.troopListContainer.innerHTML = '';
        
        let teamsToShow = [];
        let title = "部隊列表";
        let fullQueue = [];

        switch (context.type) {
            case 'world':
                title = "我方全軍總覽";
                teamsToShow = context.player.cities.flatMap(city => city.teams);
                fullQueue = Object.values(context.player.cities[0].preTrainingQueue || {}).flat();
                break;
            case 'city':
                title = `${context.cityData.name} - 部隊列表`;
                teamsToShow = context.cityData.teams.filter(team => team.status === 'garrisoned_in_city');
                fullQueue = Object.values(context.cityData.preTrainingQueue || {}).flat();
                break;
            case 'battle':
                title = "當前參戰部隊";
                const player = context.player;
                if (player && context.battleData.attackingTeamId) {
                    const attackingTeam = player.cities.flatMap(c => c.teams).find(t => t.id === context.battleData.attackingTeamId);
                    if(attackingTeam) teamsToShow = [attackingTeam];
                }
                break;
        }

        if (dom.troopListModalTitle) {
            dom.troopListModalTitle.textContent = title;
        }

        if (teamsToShow.length === 0) {
            dom.noTroopsMessage.classList.remove('hidden');
            dom.troopListContainer.appendChild(dom.noTroopsMessage);
            return;
        } else {
            dom.noTroopsMessage.classList.add('hidden');
        }

        teamsToShow.forEach((team) => {
            const originalCity = context.player?.cities.find(c => c.teams.some(t => t.id === team.id));
            const teamIndex = originalCity ? originalCity.teams.findIndex(t => t.id === team.id) : -1;

            const teamBlock = document.createElement('div');
            const isMarching = team.status === 'marching' || team.status === 'returning';
            teamBlock.className = `bg-gray-100 p-4 rounded-lg shadow-md mb-4 border border-gray-200 ${isMarching ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}`;

            if (isMarching) {
                teamBlock.addEventListener('click', () => {
                    if (typeof onMarchClick === 'function') {
                        onMarchClick(team);
                        hide(); // 點擊後關閉部隊列表
                    }
                });
            }

            let unitsHtml = '';
            for (let slotIndex = 0; slotIndex < 9; slotIndex++) {
                const unit = team.units[slotIndex];
                const trainingUnitItem = fullQueue.find(item => item.teamIndex === teamIndex && item.slotIndex === slotIndex);

                if (unit) {
                    const isDeployed = unit.x !== -1 && unit.y !== -1;
                    const statusTitle = isDeployed ? `已部署於 (${unit.x}, ${unit.y})` : '後備中';
                    const bgColor = isDeployed ? 'bg-green-100' : 'bg-yellow-100';
                    unitsHtml += `
                        <div class="flex flex-col items-center p-1 ${bgColor} rounded-md text-xs" title="${unit.name} - HP: ${unit.currentHp}/${unit.maxHp}\n狀態: ${statusTitle}">
                            <img src="${unit.imageUrl}" alt="${unit.name}" class="w-10 h-10 object-cover rounded-full ${unit.currentHp <= 0 ? 'grayscale' : ''}">
                            <span class="mt-1 truncate w-full text-center font-semibold">${unit.name}</span>
                            <span class="text-gray-600">${unit.currentHp}/${unit.maxHp}</span>
                        </div>
                    `;
                } else if (trainingUnitItem) {
                    unitsHtml += `
                        <div class="flex flex-col items-center p-1 bg-blue-100 rounded-md text-xs" title="訓練中...">
                            <img src="${trainingUnitItem.unitData.imageUrl}" class="w-10 h-10 object-cover rounded-full opacity-50">
                            <span class="mt-1 text-gray-500">訓練中</span>
                            <span class="text-blue-600 font-bold">...</span>
                        </div>
                    `;
                } else {
                    unitsHtml += `<div class="flex items-center justify-center p-1 bg-gray-200/50 border-2 border-dashed border-gray-300 rounded-md text-gray-400 h-full"><i class="fas fa-plus text-lg"></i></div>`;
                }
            }
            
            const totalHp = team.units.reduce((sum, u) => sum + (u ? u.currentHp : 0), 0);
            const maxHp = team.units.reduce((sum, u) => sum + (u ? u.maxHp : 0), 0);
            
            const statusHtml = getTeamStatusHtml(team);

            teamBlock.innerHTML = `
                <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 class="font-bold text-lg text-gray-800">${team.name}</h3>
                    <div class="flex items-center gap-4">
                        ${statusHtml}
                        <span class="text-sm text-gray-600"><i class="fas fa-heartbeat text-red-500 mr-1"></i> 生命: <span class="font-medium text-blue-700 mx-1">${totalHp}/${maxHp}</span></span>
                    </div>
                </div>
                <div class="grid grid-cols-9 gap-2">
                    ${unitsHtml}
                </div>
            `;
            dom.troopListContainer.appendChild(teamBlock);
        });
    }

    return {
        init,
        show,
        hide,
        populateTroopList
    };
})();
