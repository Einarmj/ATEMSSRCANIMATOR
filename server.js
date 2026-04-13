const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const atemService = require('./src/atemService');
const { createLargeLayout, createReturnLayout, setActivePreset, getActivePreset, createAdvancedLargeLayout, createAdvancedReturnLayout } = require('./src/layoutLogic');
const { animateLayout, cancelAnimation, EASINGS, DEFAULT_EASING } = require('./src/animation');
const { loadPresets, savePresets, mergeBuiltinPresets } = require('./src/presets');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Track current state for Companion
const state = {
    0: { preset: null, boxes: null, largeBox: null, advancedMode: false, swapped: false },
    1: { preset: null, boxes: null, largeBox: null, advancedMode: false, swapped: false },
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Companion connected');
    ws.send(JSON.stringify({ type: 'state', state }));
    ws.on('close', () => console.log('Companion disconnected'));
});

// Broadcast state change to all connected Companion instances
function broadcastState(ssId) {
    const message = JSON.stringify({ type: 'stateChange', ssId, state: state[ssId] });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

atemService.connect('10.180.103.11').catch(err => {
    console.error('Autoconnect failed:', err.message);
});

// Connect
app.post('/api/connect', async (req, res) => {
    const { ip } = req.body;
    try {
        await atemService.connect(ip);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Save current ATEM state as a named preset
app.post('/api/presets/save', (req, res) => {
    const { name, ssId } = req.body;
    if (!name || ssId === undefined) {
        return res.status(400).json({ ok: false, error: 'name and ssId required' });
    }
    const presets = loadPresets();
    presets[name] = {
        ssId,
        layout: atemService.getSuperSourceState(ssId),
    };
    savePresets(presets);
    console.log(`Saved preset "${name}" for SS${ssId}`);
    res.json({ ok: true });
});

// Load a preset onto an SS and set it as active
app.post('/api/presets/load', (req, res) => {
    const { name, durationMs = 500, ssId: ssIdOverride, easing = DEFAULT_EASING } = req.body;
    const presets = mergeBuiltinPresets(loadPresets());
    const preset = presets[name];
    if (!preset) return res.status(404).json({ ok: false, error: 'Preset not found' });

    const { layout } = preset;
    const ssId = ssIdOverride !== undefined ? parseInt(ssIdOverride, 10) : preset.ssId;

    cancelAnimation(ssId);
    atemService.forceReseed(ssId);
    const start = atemService.getSuperSourceState(ssId);

    const targetLayout = {
        boxes: layout.boxes.map((presetBox, index) => ({
            ...presetBox,
            source: start.boxes[index].source,
        }))
    };

    setActivePreset(ssId, targetLayout);
    animateLayout(ssId, start, targetLayout, durationMs, easing);

    state[ssId].preset = name;
    state[ssId].boxes = targetLayout.boxes;
    state[ssId].largeBox = null;
    state[ssId].swapped = false;
    broadcastState(ssId);

    console.log(`Loaded preset "${name}" onto SS${ssId}`);
    res.json({ ok: true });
});

// Delete a preset (only user-saved ones, not builtins)
app.delete('/api/presets/:name', (req, res) => {
    const presets = loadPresets();
    if (presets[req.params.name] && presets[req.params.name].builtin) {
        return res.status(403).json({ ok: false, error: 'Cannot delete built-in preset' });
    }
    delete presets[req.params.name];
    savePresets(presets);
    res.json({ ok: true });
});

// List all presets (builtins + saved)
app.get('/api/presets', (req, res) => {
    res.json(mergeBuiltinPresets(loadPresets()));
});

// List available easing functions
app.get('/api/easings', (req, res) => {
    res.json(Object.keys(EASINGS));
});

// Toggle advanced mode for an SS
app.post('/api/ss/:ss/advanced', (req, res) => {
    const ssId = parseInt(req.params.ss, 10);
    const { enabled } = req.body;
    const value = enabled !== undefined ? !!enabled : !state[ssId].advancedMode;

    // If disabling while swapped, snap back to the active preset immediately
    if (!value && state[ssId].swapped) {
        const preset = getActivePreset(ssId);
        if (preset) atemService.applySuperSourceState(ssId, preset);
        state[ssId].swapped = false;
        state[ssId].largeBox = null;
        cancelAnimation(ssId);
    }

    state[ssId].advancedMode = value;
    broadcastState(ssId);
    console.log(`SS${ssId} advanced mode: ${value}`);
    res.json({ ok: true, advancedMode: value });
});

// Box large
app.post('/api/ss/:ss/box/:box/large', (req, res) => {
    const ssId = parseInt(req.params.ss, 10);
    const boxIndex = parseInt(req.params.box, 10);
    const { durationMs = 500, easing = DEFAULT_EASING } = req.body;
    console.log(`SS${ssId} Box${boxIndex} large (advancedMode=${state[ssId].advancedMode})`);

    cancelAnimation(ssId);

    if (state[ssId].advancedMode) {
        const advanced = createAdvancedLargeLayout(ssId, boxIndex);
        if (advanced) {
            // Instant swap — apply before animation starts
            atemService.applySuperSourceState(ssId, advanced.swapState);
            animateLayout(ssId, advanced.swapState, advanced.target, durationMs, easing);
            state[ssId].largeBox = boxIndex;
            state[ssId].swapped = true;
            broadcastState(ssId);
            return res.json({ ok: true });
        }
        // Falls through to normal if preset doesn't have exactly 2 enabled boxes
        // or if this is the primary (top) box
    }

    const { start, target } = createLargeLayout(ssId, boxIndex);
    animateLayout(ssId, start, target, durationMs, easing);
    state[ssId].largeBox = boxIndex;
    state[ssId].swapped = false;
    broadcastState(ssId);
    res.json({ ok: true });
});

// Return
app.post('/api/ss/:ss/return', (req, res) => {
    const ssId = parseInt(req.params.ss, 10);
    const { durationMs = 500, easing = DEFAULT_EASING } = req.body;

    cancelAnimation(ssId);

    if (state[ssId].advancedMode && state[ssId].swapped) {
        const advanced = createAdvancedReturnLayout(ssId);
        if (advanced) {
            // Animate mirrors back to home positions, then invisibly swap to original boxes
            animateLayout(ssId, advanced.start, advanced.preSwapTarget, durationMs, easing, () => {
                atemService.applySuperSourceState(ssId, advanced.finalState);
                state[ssId].swapped = false;
                state[ssId].largeBox = null;
                broadcastState(ssId);
            });
            broadcastState(ssId);
            return res.json({ ok: true });
        }
    }

    const { start, target } = createReturnLayout(ssId);
    animateLayout(ssId, start, target, durationMs, easing);
    state[ssId].largeBox = null;
    state[ssId].swapped = false;
    broadcastState(ssId);
    res.json({ ok: true });
});

// Get layout
app.get('/api/layout/:ss', (req, res) => {
    res.json(atemService.getSuperSourceState(parseInt(req.params.ss, 10)));
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = { app, server, wss, state };
