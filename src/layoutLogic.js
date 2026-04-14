const atemService = require('./atemService');

// Per-SS active preset (the current baseline for box-large/return)
const activePreset = { 0: null, 1: null };
const largeMode = { 0: false, 1: false };

function cloneLayout(layout) {
    return { boxes: layout.boxes.map(b => ({ ...b })) };
}

function setActivePreset(ssId, layout) {
    activePreset[ssId] = cloneLayout(layout);
    largeMode[ssId] = false;
    console.log(`Active preset set for SS${ssId}`);
}

function getActivePreset(ssId) {
    return activePreset[ssId];
}

function createLargeLayout(ssId, boxIndex) {
    const current = atemService.getSuperSourceState(ssId);

    // If no active preset yet, use current state as baseline
    if (!activePreset[ssId]) {
        setActivePreset(ssId, current);
    }

    largeMode[ssId] = true;

    const target = cloneLayout(current);
    target.boxes[boxIndex].x = 0;
    target.boxes[boxIndex].y = 0;
    target.boxes[boxIndex].size = 1000;
    target.boxes[boxIndex].enabled = true;
    target.boxes[boxIndex].cropped = false;
    target.boxes[boxIndex].cropTop = 0;
    target.boxes[boxIndex].cropBottom = 0;
    target.boxes[boxIndex].cropLeft = 0;
    target.boxes[boxIndex].cropRight = 0;

    return { start: current, target };
}

function createReturnLayout(ssId) {
    const current = atemService.getSuperSourceState(ssId);
    const target = activePreset[ssId]
        ? cloneLayout(activePreset[ssId])
        : cloneLayout(current);

    // Preserve whatever sources are live now — only animate positions/sizes back
    target.boxes.forEach((box, i) => { box.source = current.boxes[i].source; });

    largeMode[ssId] = false;

    return { start: current, target };
}

// ── Advanced mode ──────────────────────────────────────────────────────────

// Returns the 4 relevant box indices for advanced mode, or null if not applicable.
// primaryIdx   = top-layer enabled box (lower index)
// secondaryIdx = lower-layer enabled box (higher index)
// mirrorSecondaryIdx = disabled box that will copy secondary (lower of the two disabled)
// mirrorPrimaryIdx   = disabled box that will copy primary  (higher of the two disabled)
function getAdvancedBoxIndices(ssId) {
    const preset = activePreset[ssId];
    if (!preset) return null;

    const enabled  = preset.boxes.map((b, i) => b.enabled ? i : -1).filter(i => i >= 0);
    if (enabled.length !== 2) return null;

    const [primaryIdx, secondaryIdx] = enabled;
    const mirrors = [0, 1, 2, 3].filter(i => !enabled.includes(i));
    const [mirrorSecondaryIdx, mirrorPrimaryIdx] = mirrors;

    return { primaryIdx, secondaryIdx, mirrorSecondaryIdx, mirrorPrimaryIdx };
}

// Called when making a box large in advanced mode.
// Only applies when boxIndex === secondaryIdx (the lower-layer box).
// Returns { swapState, target } or null to fall back to normal.
function createAdvancedLargeLayout(ssId, boxIndex) {
    const indices = getAdvancedBoxIndices(ssId);
    if (!indices) return null;

    const { primaryIdx, secondaryIdx, mirrorSecondaryIdx, mirrorPrimaryIdx } = indices;
    if (boxIndex !== secondaryIdx) return null; // primary box — use normal path

    const preset = activePreset[ssId];
    const current = atemService.getSuperSourceState(ssId);

    // Swap state: mirror boxes enabled at preset positions with live sources, originals disabled
    const swapState = {
        boxes: [0, 1, 2, 3].map(i => {
            if (i === mirrorSecondaryIdx) return { ...preset.boxes[secondaryIdx], source: current.boxes[secondaryIdx].source, enabled: true };
            if (i === mirrorPrimaryIdx)   return { ...preset.boxes[primaryIdx],   source: current.boxes[primaryIdx].source,   enabled: true };
            return { ...preset.boxes[i], source: current.boxes[i].source, enabled: false };
        })
    };

    // Large target: mirrorSecondaryIdx fills the screen, mirrorPrimaryIdx stays visible, originals stay hidden
    const target = {
        boxes: swapState.boxes.map((box, i) => {
            if (i === mirrorSecondaryIdx) {
                return { ...box, x: 0, y: 0, size: 1000, enabled: true, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 };
            }
            if (i === mirrorPrimaryIdx) {
                return { ...box, enabled: true }; // keep the background box visible
            }
            return { ...box, enabled: false };
        })
    };

    return { swapState, target };
}

// Called when returning in advanced mode (while swapped).
// Returns { preSwapTarget, finalState } or null to fall back to normal.
// preSwapTarget: animate mirrors back to preset positions (seamless)
// finalState:    original preset to apply invisibly after animation
function createAdvancedReturnLayout(ssId) {
    const indices = getAdvancedBoxIndices(ssId);
    if (!indices) return null;

    const { primaryIdx, secondaryIdx, mirrorSecondaryIdx, mirrorPrimaryIdx } = indices;
    const preset = activePreset[ssId];
    const current = atemService.getSuperSourceState(ssId);

    // Animate mirrors back to their home positions, preserving live sources
    const preSwapTarget = {
        boxes: current.boxes.map((box, i) => {
            if (i === mirrorSecondaryIdx) return { ...preset.boxes[secondaryIdx], source: current.boxes[i].source, enabled: true };
            if (i === mirrorPrimaryIdx)   return { ...preset.boxes[primaryIdx],   source: current.boxes[i].source, enabled: true };
            return { ...box, enabled: false };
        })
    };

    const finalState = cloneLayout(preset);
    finalState.boxes.forEach((box, i) => { box.source = current.boxes[i].source; });

    return { start: current, preSwapTarget, finalState };
}

module.exports = { createLargeLayout, createReturnLayout, setActivePreset, getActivePreset, getAdvancedBoxIndices, createAdvancedLargeLayout, createAdvancedReturnLayout };