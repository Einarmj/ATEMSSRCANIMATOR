const EASING_CHOICES = [
    { id: 'linear',         label: 'Linear' },
    { id: 'easeInQuad',     label: 'Ease In' },
    { id: 'easeOutQuad',    label: 'Ease Out' },
    { id: 'easeInOutQuad',  label: 'Ease In/Out' },
    { id: 'easeInCubic',    label: 'Ease In (Strong)' },
    { id: 'easeOutCubic',   label: 'Ease Out (Strong)' },
    { id: 'easeInOutCubic', label: 'Ease In/Out (Strong)' },
    { id: 'easeInExpo',     label: 'Ease In (Expo)' },
    { id: 'easeOutExpo',    label: 'Ease Out (Expo)' },
    { id: 'easeInOutExpo',  label: 'Ease In/Out (Expo)' },
]

const DURATION_OPTION = {
    type: 'textinput',
    id: 'duration',
    label: 'Duration (ms)',
    default: '500',
    regex: '/^\\d+$/',
}

const EASING_OPTION = {
    type: 'dropdown',
    id: 'easing',
    label: 'Easing',
    choices: EASING_CHOICES,
    default: 'linear',
}

// Resolve a preset reference (slot number or name, may contain variables) to a preset name.
// Returns null if not found.
async function resolvePreset(instance, raw) {
    const value = (await instance.parseVariablesInString(raw)).trim()
    const idx = parseInt(value)
    if (!isNaN(idx) && String(idx) === value) {
        // Numeric: treat as 1-based slot index
        return Object.keys(instance.presets)[idx - 1] ?? null
    }
    // String: treat as preset name
    return instance.presets[value] !== undefined ? value : null
}

exports.getActions = (instance) => {
    const presetChoices = Object.keys(instance.presets).map(name => ({ id: name, label: name }))

    return {
        // ── Load Preset (dropdown) ────────────────────────────────────────────
        load_preset_ss0: {
            name: 'Load Preset on SS1 (dropdown)',
            options: [
                { type: 'dropdown', id: 'preset', label: 'Preset', choices: presetChoices, default: presetChoices[0]?.id ?? '' },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: { name: action.options.preset, ssId: 0, durationMs: parseInt(action.options.duration), easing: action.options.easing },
                })
            },
        },

        load_preset_ss1: {
            name: 'Load Preset on SS2 (dropdown)',
            options: [
                { type: 'dropdown', id: 'preset', label: 'Preset', choices: presetChoices, default: presetChoices[0]?.id ?? '' },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: { name: action.options.preset, ssId: 1, durationMs: parseInt(action.options.duration), easing: action.options.easing },
                })
            },
        },

        // ── Load Preset (number / variable) ───────────────────────────────────
        load_preset_by_ref_ss0: {
            name: 'Load Preset on SS1 (number or variable)',
            options: [
                { type: 'textinput', id: 'preset', label: 'Preset (slot number or name, supports variables)', default: '1', useVariables: true },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                const name = await resolvePreset(instance, action.options.preset)
                if (!name) return
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: { name, ssId: 0, durationMs: parseInt(action.options.duration), easing: action.options.easing },
                })
            },
        },

        load_preset_by_ref_ss1: {
            name: 'Load Preset on SS2 (number or variable)',
            options: [
                { type: 'textinput', id: 'preset', label: 'Preset (slot number or name, supports variables)', default: '1', useVariables: true },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                const name = await resolvePreset(instance, action.options.preset)
                if (!name) return
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: { name, ssId: 1, durationMs: parseInt(action.options.duration), easing: action.options.easing },
                })
            },
        },

        // ── Box Large ─────────────────────────────────────────────────────────
        box_large_ss0: {
            name: 'Make Box Large on SS1',
            options: [
                {
                    type: 'dropdown',
                    id: 'box',
                    label: 'Box',
                    choices: [
                        { id: '0', label: 'Box 1' },
                        { id: '1', label: 'Box 2' },
                        { id: '2', label: 'Box 3' },
                        { id: '3', label: 'Box 4' },
                    ],
                    default: '0',
                },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: `/api/ss/0/box/${action.options.box}/large`,
                    body: {
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
                })
            },
        },

        box_large_ss1: {
            name: 'Make Box Large on SS2',
            options: [
                {
                    type: 'dropdown',
                    id: 'box',
                    label: 'Box',
                    choices: [
                        { id: '0', label: 'Box 1' },
                        { id: '1', label: 'Box 2' },
                        { id: '2', label: 'Box 3' },
                        { id: '3', label: 'Box 4' },
                    ],
                    default: '0',
                },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: `/api/ss/1/box/${action.options.box}/large`,
                    body: {
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
                })
            },
        },

        // ── Advanced Mode Toggle ──────────────────────────────────────────────
        advanced_mode_ss0: {
            name: 'Toggle Advanced Mode on SS1',
            options: [
                {
                    type: 'dropdown',
                    id: 'enabled',
                    label: 'State',
                    choices: [
                        { id: 'toggle', label: 'Toggle' },
                        { id: 'true',   label: 'Enable' },
                        { id: 'false',  label: 'Disable' },
                    ],
                    default: 'toggle',
                },
            ],
            callback: async (action) => {
                const body = action.options.enabled === 'toggle'
                    ? {}
                    : { enabled: action.options.enabled === 'true' }
                await instance.handleAction({ endpoint: '/api/ss/0/advanced', body })
            },
        },

        advanced_mode_ss1: {
            name: 'Toggle Advanced Mode on SS2',
            options: [
                {
                    type: 'dropdown',
                    id: 'enabled',
                    label: 'State',
                    choices: [
                        { id: 'toggle', label: 'Toggle' },
                        { id: 'true',   label: 'Enable' },
                        { id: 'false',  label: 'Disable' },
                    ],
                    default: 'toggle',
                },
            ],
            callback: async (action) => {
                const body = action.options.enabled === 'toggle'
                    ? {}
                    : { enabled: action.options.enabled === 'true' }
                await instance.handleAction({ endpoint: '/api/ss/1/advanced', body })
            },
        },

        // ── Save Preset ───────────────────────────────────────────────────────
        save_preset_ss0: {
            name: 'Save Current State as Preset on SS1',
            options: [
                { type: 'textinput', id: 'name', label: 'Preset Name', default: '', useVariables: true },
            ],
            callback: async (action) => {
                const name = (await instance.parseVariablesInString(action.options.name)).trim()
                if (!name) return
                await instance.handleAction({
                    endpoint: '/api/presets/save',
                    body: { name, ssId: 0 },
                })
            },
        },

        save_preset_ss1: {
            name: 'Save Current State as Preset on SS2',
            options: [
                { type: 'textinput', id: 'name', label: 'Preset Name', default: '', useVariables: true },
            ],
            callback: async (action) => {
                const name = (await instance.parseVariablesInString(action.options.name)).trim()
                if (!name) return
                await instance.handleAction({
                    endpoint: '/api/presets/save',
                    body: { name, ssId: 1 },
                })
            },
        },

        // ── Return ────────────────────────────────────────────────────────────
        return_ss0: {
            name: 'Return to Preset on SS1',
            options: [
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/ss/0/return',
                    body: {
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
                })
            },
        },

        return_ss1: {
            name: 'Return to Preset on SS2',
            options: [
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/ss/1/return',
                    body: {
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
                })
            },
        },
    }
}
