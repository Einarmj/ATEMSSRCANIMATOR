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

document.getElementById('duration').addEventListener('change', () => {
    localStorage.setItem('ssrc_duration', document.getElementById('duration').value);
});

async function loadEasingOptions() {
    const easings = await fetch('/api/easings').then(r => r.json());
    const sel = document.getElementById('easing');
    const savedEasing = localStorage.getItem('ssrc_easing') || 'easeInOutQuad';
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
        if (key === savedEasing) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.addEventListener('change', () => localStorage.setItem('ssrc_easing', sel.value));

    const savedDuration = localStorage.getItem('ssrc_duration');
    if (savedDuration) document.getElementById('duration').value = savedDuration;
}

let ssCount = 1;

async function loadPresetList() {
    const presets = await fetch('/api/presets').then(r => r.json());
    const container = document.getElementById('preset-list');
    container.innerHTML = '';
    Object.entries(presets).forEach(([name]) => {
        const div = document.createElement('div');
        div.className = 'preset-row';
        div.dataset.name = name;
        const ss2btn = ssCount >= 2
            ? `<button class="load-btn" data-ss="1" onclick="loadPreset('${name}', 1)">Load SS2</button>`
            : '';
        div.innerHTML = `
            <span class="preset-name">${name}</span>
            <button class="load-btn" data-ss="0" onclick="loadPreset('${name}', 0)">Load SS1</button>
            ${ss2btn}
            <button class="delete-btn" onclick="deletePreset('${name}')">Delete</button>
        `;
        container.appendChild(div);
    });
    applyFeedback();
}

async function loadPreset(name, ssId) {
    await postJson('/api/presets/load', { name, ssId, durationMs: getDuration(), easing: getEasing() });
}

async function deletePreset(name) {
    if (!confirm(`Delete preset "${name}"?`)) return;
    await deleteJson(`/api/presets/${name}`);
    loadPresetList();
}

let _flashInterval = null

function setConnectionStatus(connected) {
    const btn = document.getElementById('connect-btn')
    const status = document.getElementById('status')
    if (_flashInterval) { clearInterval(_flashInterval); _flashInterval = null; }
    if (connected) {
        status.textContent = 'Connected'
        btn.style.background = '#1a6a1a'
    } else {
        status.textContent = 'ATEM disconnected'
        let on = true
        _flashInterval = setInterval(() => {
            btn.style.background = on ? '#cc0000' : ''
            on = !on
        }, 500)
    }
}

document.getElementById('connect-btn').addEventListener('click', async () => {
    const ip = document.getElementById('atem-ip').value;
    const result = await postJson('/api/connect', { ip });
    if (!result.ok) document.getElementById('status').textContent = 'Failed: ' + result.error;
});

async function savePreset(ssId) {
    const name = document.getElementById('preset-name').value.trim();
    if (!name) return alert('Enter a preset name');
    await postJson('/api/presets/save', { name, ssId });
    loadPresetList();
}

document.getElementById('save-ss0-btn').addEventListener('click', () => savePreset(0));
document.getElementById('save-ss1-btn').addEventListener('click', () => savePreset(1));

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

function applySuperSourceCount(count) {
    const changed = count !== ssCount
    ssCount = count
    const show = count >= 2
    document.getElementById('ss1-section').style.display = show ? '' : 'none'
    document.getElementById('save-ss1-btn').style.display = show ? '' : 'none'
    if (changed) loadPresetList()
}

function applyFeedback() {
    // Preset load buttons
    document.querySelectorAll('.preset-row').forEach(row => {
        const name = row.dataset.name
        row.querySelectorAll('.load-btn').forEach(btn => {
            const ss = parseInt(btn.dataset.ss, 10)
            btn.classList.toggle('active', wsState[ss].preset === name)
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
            if (msg.type === 'atemStatus') {
                setConnectionStatus(msg.connected)
            } else if (msg.type === 'state') {
                if (msg.atemConnected !== undefined) setConnectionStatus(msg.atemConnected)
                if (msg.superSourceCount !== undefined) applySuperSourceCount(msg.superSourceCount)
                wsState[0] = { preset: msg.state[0].preset, largeBox: msg.state[0].largeBox, advancedMode: msg.state[0].advancedMode }
                if (msg.state[1]) wsState[1] = { preset: msg.state[1].preset, largeBox: msg.state[1].largeBox, advancedMode: msg.state[1].advancedMode }
                applyFeedback()
            } else if (msg.type === 'stateChange') {
                wsState[msg.ssId] = { preset: msg.state.preset, largeBox: msg.state.largeBox, advancedMode: msg.state.advancedMode }
                applyFeedback()
            }
        } catch (e) { /* ignore parse errors */ }
    })

    ws.addEventListener('close', () => setTimeout(connectFeedbackSocket, 3000))
}

async function loadInfo() {
    try {
        const info = await fetch('/api/info').then(r => r.json())
        setConnectionStatus(info.atemConnected)
        applySuperSourceCount(info.superSourceCount)
        if (info.atemIp) document.getElementById('atem-ip').value = info.atemIp
    } catch (e) { /* ignore */ }
}

connectFeedbackSocket();
loadEasingOptions();
loadPresetList();
loadInfo();
