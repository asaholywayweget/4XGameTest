// src/game/dispatchModal.js
// 職責：專門管理「派遣部隊」這個 UI 彈窗的顯示、隱藏和內容填充邏輯。

let dom = {};
let onDispatchCallback;
let getCurrentPlayerRef;

function show(targetTile, command, targetCoords) {
    const player = getCurrentPlayerRef();
    if (!player || !player.cities[0]) return;
    const city = player.cities[0];
    const allTeams = city.teams;

    dom.dispatchModalTitle.textContent = {
        'occupy_resource': `攻佔資源點: (${targetCoords.row}, ${targetCoords.col})`,
        'occupy_city': `攻擊城市: ${targetTile.ownerName}`,
        'march': `行進至: (${targetCoords.row}, ${targetCoords.col})`,
        'return_to_city': '選擇部隊返回主城'
    }[command];

    dom.dispatchTeamList.innerHTML = '';
    if (allTeams.length === 0) {
        dom.dispatchTeamList.innerHTML = `<p class="text-center text-gray-400">無任何部隊。</p>`;
    }

    const recruitingTeamIndexes = new Set(
        Object.values(city.preTrainingQueue).flat().map(item => item.teamIndex)
    );

    allTeams.forEach((team, teamIndex) => {
        let isAvailable = true;
        let reason = '';

        if (recruitingTeamIndexes.has(teamIndex)) {
            isAvailable = false;
            reason = '招募中';
        } else if (team.status === 'marching' || team.status === 'returning') {
            isAvailable = false;
            reason = `行軍中 (前往 ${team.marchTarget.name})`;
        } else if (team.status === 'in_battle') {
            isAvailable = false;
            reason = `交戰中`;
        } else if (command === 'return_to_city') {
            if (team.status !== 'garrisoned_on_tile') {
                isAvailable = false;
                reason = '已在主城';
            }
        } else {
            if (team.status === 'garrisoned_on_tile' && team.location.row === targetCoords.row && team.location.col === targetCoords.col) {
                isAvailable = false;
                reason = '已在此地';
            }
        }

        const teamEl = document.createElement('div');
        teamEl.className = `bg-gray-700 p-3 rounded-lg flex items-center justify-between transition-colors ${!isAvailable ? 'opacity-50' : 'hover:bg-gray-600'}`;

        const totalHp = team.units.reduce((sum, u) => sum + (u ? u.currentHp : 0), 0);
        const maxHp = team.units.reduce((sum, u) => sum + (u ? u.maxHp : 0), 0);
        const hpPercentage = maxHp > 0 ? (totalHp / maxHp * 100).toFixed(0) : 0;

        teamEl.innerHTML = `
            <div class="flex-grow mr-4">
                <p class="font-bold text-white">${team.name}</p>
                <div class="w-full bg-gray-900 rounded-full h-2.5 mt-2">
                    <div class="bg-green-500 h-2.5 rounded-full" style="width: ${hpPercentage}%" title="HP: ${hpPercentage}%"></div>
                </div>
                ${reason ? `<p class="text-xs text-yellow-400 font-bold mt-1">狀態: ${reason}</p>` : ''}
            </div>
            <button class="dispatch-btn bg-cyan-600 text-white font-bold py-2 px-4 rounded flex-shrink-0" ${!isAvailable ? 'disabled' : ''}>派遣</button>
        `;

        if (isAvailable) {
            teamEl.querySelector('.dispatch-btn').onclick = () => {
                if (onDispatchCallback) {
                    onDispatchCallback(team.id, targetTile, command, targetCoords);
                }
                hide();
            };
        }
        dom.dispatchTeamList.appendChild(teamEl);
    });

    dom.dispatchModalOverlay.classList.remove('hidden');
}

function hide() {
    dom.dispatchModalOverlay.classList.add('hidden');
}

export const dispatchModal = {
    init: (dependencies) => {
        dom.dispatchModalOverlay = document.getElementById('dispatch-modal-overlay');
        dom.dispatchModalClose = document.getElementById('dispatch-modal-close');
        dom.dispatchTeamList = document.getElementById('dispatch-team-list');
        dom.dispatchModalTitle = document.getElementById('dispatch-modal-title');
        
        onDispatchCallback = dependencies.onDispatch;
        getCurrentPlayerRef = dependencies.getCurrentPlayer;

        if (dom.dispatchModalOverlay) dom.dispatchModalOverlay.addEventListener('click', e => { if (e.target === dom.dispatchModalOverlay) hide(); });
        if (dom.dispatchModalClose) dom.dispatchModalClose.addEventListener('click', hide);
    },
    show
};
