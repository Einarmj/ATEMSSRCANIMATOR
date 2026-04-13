exports.getFeedbacks = (instance) => {
    const presetChoices = Object.keys(instance.presets).map(name => ({ id: name, label: name }))
    const boxChoices = [
        { id: '0', label: 'Box 1' },
        { id: '1', label: 'Box 2' },
        { id: '2', label: 'Box 3' },
        { id: '3', label: 'Box 4' },
    ]

    return {
        // ── Active preset ─────────────────────────────────────────────────────
        active_preset_ss0: {
            type: 'boolean',
            name: 'SS1: Preset Active',
            description: 'Red highlight when this preset is active on SS1',
            options: [
                {
                    type: 'dropdown',
                    id: 'preset',
                    label: 'Preset',
                    choices: presetChoices,
                    default: presetChoices[0]?.id ?? '',
                },
            ],
            callback: (feedback) => {
                return instance.state[0].preset === feedback.options.preset
            },
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },

        active_preset_ss1: {
            type: 'boolean',
            name: 'SS2: Preset Active',
            description: 'Red highlight when this preset is active on SS2',
            options: [
                {
                    type: 'dropdown',
                    id: 'preset',
                    label: 'Preset',
                    choices: presetChoices,
                    default: presetChoices[0]?.id ?? '',
                },
            ],
            callback: (feedback) => {
                return instance.state[1].preset === feedback.options.preset
            },
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },

        // ── Advanced mode active ──────────────────────────────────────────────
        advanced_mode_ss0: {
            type: 'boolean',
            name: 'SS1: Advanced Mode Active',
            description: 'Red highlight when advanced mode is ON for SS1',
            options: [],
            callback: () => !!instance.state[0].advancedMode,
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },

        advanced_mode_ss1: {
            type: 'boolean',
            name: 'SS2: Advanced Mode Active',
            description: 'Red highlight when advanced mode is ON for SS2',
            options: [],
            callback: () => !!instance.state[1].advancedMode,
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },

        // ── Box large active ──────────────────────────────────────────────────
        box_large_ss0: {
            type: 'boolean',
            name: 'SS1: Box Large Active',
            description: 'Red highlight when this box is enlarged on SS1',
            options: [
                {
                    type: 'dropdown',
                    id: 'box',
                    label: 'Box',
                    choices: boxChoices,
                    default: '0',
                },
            ],
            callback: (feedback) => {
                return instance.state[0].largeBox === parseInt(feedback.options.box)
            },
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },

        box_large_ss1: {
            type: 'boolean',
            name: 'SS2: Box Large Active',
            description: 'Red highlight when this box is enlarged on SS2',
            options: [
                {
                    type: 'dropdown',
                    id: 'box',
                    label: 'Box',
                    choices: boxChoices,
                    default: '0',
                },
            ],
            callback: (feedback) => {
                return instance.state[1].largeBox === parseInt(feedback.options.box)
            },
            defaultStyle: {
                bgcolor: 0xcc0000,
                color: 0xffffff,
            },
        },
    }
}
