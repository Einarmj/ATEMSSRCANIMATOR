const atemService = require('./atemService');

const animations = { 0: null, 1: null };

function lerp(a, b, t) { return a + (b - a) * t; }

const EASINGS = {
    linear:         (t) => t,
    easeInQuad:     (t) => t * t,
    easeOutQuad:    (t) => t * (2 - t),
    easeInOutQuad:  (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic:    (t) => t * t * t,
    easeOutCubic:   (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInExpo:     (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    easeOutExpo:    (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo:  (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
};

// Default easing used when none is specified
const DEFAULT_EASING = 'easeInOutQuad';

function resolveEasing(name) {
    return EASINGS[name] || EASINGS[DEFAULT_EASING];
}

function interpolateLayout(start, target, t) {
    return {
        boxes: start.boxes.map((box, i) => {
            const to = target.boxes[i];
            return {
                enabled: to.enabled,
                source: to.source,
                x: lerp(box.x, to.x, t),
                y: lerp(box.y, to.y, t),
                size: lerp(box.size, to.size, t),
                cropped: to.cropped,
                cropTop: lerp(box.cropTop, to.cropTop, t),
                cropBottom: lerp(box.cropBottom, to.cropBottom, t),
                cropLeft: lerp(box.cropLeft, to.cropLeft, t),
                cropRight: lerp(box.cropRight, to.cropRight, t),
            };
        }),
    };
}

function cancelAnimation(ssId) {
    if (animations[ssId]) {
        animations[ssId].cancel();
        animations[ssId] = null;
    }
}

function animateLayout(ssId, start, target, durationMs = 500, easing = DEFAULT_EASING, onComplete = null) {
    easing = resolveEasing(easing);
    cancelAnimation(ssId);
    const startTime = Date.now();
    let cancelled = false;

    function frame() {
        if (cancelled) return;
        const u = Math.min(1, (Date.now() - startTime) / durationMs);
        atemService.applySuperSourceState(ssId, interpolateLayout(start, target, easing(u)));
        if (u < 1) {
            setTimeout(frame, 33);
        } else if (onComplete) {
            onComplete();
        }
    }

    setTimeout(frame, 0);
    animations[ssId] = { cancel: () => { cancelled = true; } };
    return animations[ssId];
}

module.exports = { animateLayout, cancelAnimation, EASINGS, DEFAULT_EASING };