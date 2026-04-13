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
    default: 'easeInOutQuad',
}

exports.getActions = (instance) => {
    const presetChoices = Object.keys(instance.presets).map(name => ({ id: name, label: name }))

    return {
        // ── Load Preset ───────────────────────────────────────────────────────
        load_preset_ss0: {
            name: 'Load Preset on SS1',
            options: [
                {
                    type: 'dropdown',
                    id: 'preset',
                    label: 'Preset',
                    choices: presetChoices,
                    default: presetChoices[0]?.id ?? '',
                },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: {
                        name: action.options.preset,
                        ssId: 0,
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
                })
            },
        },

        load_preset_ss1: {
            name: 'Load Preset on SS2',
            options: [
                {
                    type: 'dropdown',
                    id: 'preset',
                    label: 'Preset',
                    choices: presetChoices,
                    default: presetChoices[0]?.id ?? '',
                },
                DURATION_OPTION,
                EASING_OPTION,
            ],
            callback: async (action) => {
                await instance.handleAction({
                    endpoint: '/api/presets/load',
                    body: {
                        name: action.options.preset,
                        ssId: 1,
                        durationMs: parseInt(action.options.duration),
                        easing: action.options.easing,
                    },
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
