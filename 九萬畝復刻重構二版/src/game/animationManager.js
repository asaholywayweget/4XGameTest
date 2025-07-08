// src/game/animationManager.js
// 職責：處理所有基於時間的視覺動畫，例如單位的平滑移動和攻擊動畫。

export const animationManager = (() => {
    const DURATION_PER_TILE = 1000;
    const ATTACK_ANIMATION_DURATION = 1000;
    let activeAnimations = [];
    let actionInProgress = false;

    function startUnitMoveAnimation(unit, path) {
        if (unit.isMoving || path.length <= 1) return;
        actionInProgress = true;
        unit.isMoving = true;
        const animation = {
            type: 'move',
            unit,
            path,
            startTime: Date.now(),
            durationPerSegment: DURATION_PER_TILE,
            totalDuration: (path.length - 1) * DURATION_PER_TILE,
            onComplete: () => {
                const finalPos = path[path.length - 1];
                unit.x = finalPos.x;
                unit.y = finalPos.y;
                delete unit.displayX;
                delete unit.displayY;
                unit.isMoving = false;
                actionInProgress = false;
            }
        };
        activeAnimations.push(animation);
    }

    function startAttackAnimation(unit, onDamageApply) {
        actionInProgress = true;
        unit.isAttacking = true;
        const animation = {
            type: 'attack',
            unit,
            startTime: Date.now(),
            totalDuration: ATTACK_ANIMATION_DURATION,
            onComplete: () => {
                delete unit.isAttacking;
                actionInProgress = false;
            }
        };
        
        // 在動畫中途施加傷害
        setTimeout(onDamageApply, ATTACK_ANIMATION_DURATION / 2);

        activeAnimations.push(animation);
    }

    function updateAnimations() {
        const now = Date.now();
        for (let i = activeAnimations.length - 1; i >= 0; i--) {
            const anim = activeAnimations[i];
            const elapsed = now - anim.startTime;

            if (elapsed >= anim.totalDuration) {
                anim.onComplete();
                activeAnimations.splice(i, 1);
            } else {
                if (anim.type === 'move') {
                    const { unit, path, durationPerSegment } = anim;
                    const segmentIndex = Math.floor(elapsed / durationPerSegment);
                    const segmentProgress = (elapsed % durationPerSegment) / durationPerSegment;
                    const startPos = path[segmentIndex];
                    const endPos = path[segmentIndex + 1];
                    unit.displayX = startPos.x + (endPos.x - startPos.x) * segmentProgress;
                    unit.displayY = startPos.y + (endPos.y - startPos.y) * segmentProgress;
                }
            }
        }
    }

    function isActionInProgress() {
        return actionInProgress;
    }

    return {
        startUnitMoveAnimation,
        startAttackAnimation,
        updateAnimations,
        isActionInProgress
    };
})();
