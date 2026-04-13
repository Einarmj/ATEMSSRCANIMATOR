const fs = require('fs');
const path = require('path');

const PRESETS_FILE = path.join(__dirname, '..', 'presets.json');

// Built-in presets — ssId 0 = SS0, 1 = SS1
// Boxes are in atem-connection format (lowercase keys, scaled values)
const BUILTIN_PRESETS = {
    'PPT RIGHT': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: 503, y: 0, size: 667, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: true, source: 0, x: -1087, y: 0, size: 500, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 6220, cropRight: 6220 },
                { enabled: false, source: 0, x: -1145, y: 0, size: 718, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 9670, cropRight: 9680 },
                { enabled: false, source: 0, x: 0, y: 0, size: 70, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    'PPT LEFT': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: -497, y: 0, size: 667, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: true, source: 0, x: 1083, y: 0, size: 500, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 6220, cropRight: 6220 },
                { enabled: false, source: 0, x: -1145, y: 0, size: 718, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 9670, cropRight: 9680 },
                { enabled: false, source: 0, x: 0, y: 0, size: 70, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    'ZOOM': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: 790, y: 0, size: 480, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: true, source: 0, x: -790, y: 0, size: 480, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: -790, y: 0, size: 480, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: 790, y: 0, size: 480, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    'THREE': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: -525, y: 0, size: 620, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: true, source: 0, x: 1000, y: 287, size: 300, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: true, source: 0, x: 1000, y: -287, size: 300, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: 0, y: 0, size: 70, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    'Q&A': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: 518, y: -10, size: 476, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: -3200, y: 0, size: 1000, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: -3200, y: 0, size: 1000, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
                { enabled: false, source: 0, x: -3200, y: 0, size: 1000, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    'Three Horizontal': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: -1014, y: 0, size: 603, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 7810, cropRight: 7810 },
                { enabled: true, source: 0, x: -28, y: 0, size: 603, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 8040, cropRight: 8040 },
                { enabled: true, source: 0, x: 997, y: 0, size: 603, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 8040, cropRight: 8040 },
                { enabled: false, source: 0, x: 0, y: 0, size: 70, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
    '4:3 PPT': {
        builtin: true,
        ssId: 0,
        layout: {
            boxes: [
                { enabled: true, source: 0, x: 535, y: 30, size: 840, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 4010, cropRight: 4020 },
                { enabled: true, source: 0, x: -1017, y: 0, size: 500, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 6220, cropRight: 6220 },
                { enabled: false, source: 0, x: -1145, y: 0, size: 718, cropped: true, cropTop: 0, cropBottom: 0, cropLeft: 9670, cropRight: 9680 },
                { enabled: false, source: 0, x: 0, y: 0, size: 70, cropped: false, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 },
            ]
        },
    },
};

function loadPresets() {
    try {
        if (fs.existsSync(PRESETS_FILE)) {
            return JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Failed to load presets:', e);
    }
    return {};
}

function savePresets(presets) {
    try {
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
    } catch (e) {
        console.error('Failed to save presets:', e);
    }
}

// Merge builtins with user presets — builtins always present, user presets can override
function mergeBuiltinPresets(userPresets) {
    return { ...BUILTIN_PRESETS, ...userPresets };
}

module.exports = { loadPresets, savePresets, mergeBuiltinPresets };