async function postJson(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
    });
    if (!res.ok) {
        console.error('Request failed', url, await res.text());
        return { ok: false };
    }
    return res.json();
}

async function deleteJson(url) {
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
}

function getDuration() {
    return parseInt(document.getElementById('duration').value, 10) || 500;
}

function getEasing() {
    return document.getElementById('easing').value || 'easeInOutQuad';
}

async function loadEasingOptions() {
    const easings = await fetch('/api/easings').then(r => r.json());
    const sel = document.getElementById('easing');
    const labels = {
        linear: 'Linear',
        easeInQuad: 'Ease In',
        easeOutQuad: 'Ease Out',
        easeInOutQuad: 'Ease In/Out',
        easeInCubic: 'Ease In (Strong)',
        easeOutCubic: 'Ease Out (Strong)',
        easeInOutCubic: 'Ease In/Out (Strong)',
        easeInExpo: 'Ease In (Expo)',
        easeOutExpo: 'Ease Out (Expo)',
        easeInOutExpo: 'Ease In/Out (Expo)',
    };
    easings.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = labels[key] || key;
        if (key === 'easeInOutQuad') opt.selected = true;
        sel.appendChild(opt);
    });
}

async function loadPresetList() {
    const presets = await fetch('/api/presets').then(r => r.json());
    const container = document.getElementById('preset-list');
    container.innerHTML = '';
    Object.entries(presets).forEach(([name, preset]) => {
        const div = document.createElement('div');
        div.className = 'preset-row';
        div.dataset.name = name;
        div.innerHTML = `
            <span class="preset-name">${name} <small>(SS${parseInt(preset.ssId) + 1})</small></span>
            <button onclick="loadPreset('${name}')">Load</button>
            <button class="delete-btn" onclick="deletePreset('${name}')">Delete</button>
        `;
        container.appendChild(div);
    });
    applyFeedback();
}

async function loadPreset(name) {
    await postJson('/api/presets/load', { name, durationMs: getDuration(), easing: getEasing() });
}

async function deletePreset(name) {
    await deleteJson(`/api/presets/${name}`);
    loadPresetList();
}

document.getElementById('connect-btn').addEventListener('click', async () => {
    const ip = document.getElementById('atem-ip').value;
    const result = await postJson('/api/connect', { ip });
    document.getElementById('status').textContent = result.ok ? 'Connected' : 'Failed: ' + result.error;
});

document.getElementById('save-preset-btn').addEventListener('click', async () => {
    const name = document.getElementById('preset-name').value.trim();
    const ssId = parseInt(document.getElementById('preset-ss').value, 10);
    if (!name) return alert('Enter a preset name');
    await postJson('/api/presets/save', { name, ssId });
    loadPresetList();
});

document.querySelectorAll('.large-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const ss = parseInt(btn.dataset.ss, 10);
        const box = parseInt(btn.dataset.box, 10);
        await postJson(`/api/ss/${ss}/box/${box}/large`, { durationMs: getDuration(), easing: getEasing() });
    });
});

document.querySelectorAll('.return-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const ss = parseInt(btn.dataset.ss, 10);
        await postJson(`/api/ss/${ss}/return`, { durationMs: getDuration(), easing: getEasing() });
    });
});

document.querySelectorAll('.advanced-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const ss = parseInt(btn.dataset.ss, 10);
        await postJson(`/api/ss/${ss}/advanced`, {});
        // Button text/style updated via WebSocket feedback
    });
});

// ── WebSocket feedback ────────────────────────────────────────────────────────

const wsState = {
    0: { preset: null, largeBox: null, advancedMode: false },
    1: { preset: null, largeBox: null, advancedMode: false },
}

function applyFeedback() {
    // Preset rows
    document.querySelectorAll('.preset-row').forEach(row => {
        const name = row.dataset.name
        row.querySelectorAll('.active-badge').forEach(b => b.remove())
        ;[0, 1].forEach(ss => {
            if (wsState[ss].preset === name) {
                const badge = document.createElement('span')
                badge.className = 'active-badge'
                badge.textContent = `SS${ss + 1}`
                row.querySelector('.preset-name').appendChild(badge)
            }
        })
    })

    // Box large buttons
    document.querySelectorAll('.large-btn').forEach(btn => {
        const ss = parseInt(btn.dataset.ss, 10)
        const box = parseInt(btn.dataset.box, 10)
        btn.classList.toggle('active', wsState[ss].largeBox === box)
    })

    // Return buttons
    document.querySelectorAll('.return-btn').forEach(btn => {
        const ss = parseInt(btn.dataset.ss, 10)
        btn.classList.toggle('has-large', wsState[ss].largeBox !== null)
    })

    // Advanced mode toggle buttons
    document.querySelectorAll('.advanced-btn').forEach(btn => {
        const ss = parseInt(btn.dataset.ss, 10)
        const on = wsState[ss].advancedMode
        btn.classList.toggle('active', on)
        btn.textContent = `Advanced Mode: ${on ? 'ON' : 'OFF'}`
    })
}

function connectFeedbackSocket() {
    const ws = new WebSocket(`ws://${location.host}`)

    ws.addEventListener('message', (event) => {
        try {
            const msg = JSON.parse(event.data)
            if (msg.type === 'state') {
                wsState[0] = { preset: msg.state[0].preset, largeBox: msg.state[0].largeBox, advancedMode: msg.state[0].advancedMode }
                wsState[1] = { preset: msg.state[1].preset, largeBox: msg.state[1].largeBox, advancedMode: msg.state[1].advancedMode }
                applyFeedback()
            } else if (msg.type === 'stateChange') {
                wsState[msg.ssId] = { preset: msg.state.preset, largeBox: msg.state.largeBox, advancedMode: msg.state.advancedMode }
                applyFeedback()
            }
        } catch (e) { /* ignore parse errors */ }
    })

    ws.addEventListener('close', () => setTimeout(connectFeedbackSocket, 3000))
}

connectFeedbackSocket();
loadEasingOptions();
loadPresetList();
