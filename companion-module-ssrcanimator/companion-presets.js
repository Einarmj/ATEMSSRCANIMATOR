exports.getPresets = (instance) => {
    const presets = []
    const presetNames = Object.keys(instance.presets)
    const SLOTS = Math.max(10, presetNames.length)

    // ── SS1 (ss0) Layout Presets ──────────────────────────────────────────────
    for (let slot = 0; slot < SLOTS; slot++) {
        const name = presetNames[slot]
        if (name) {
            presets.push({
                category: 'SS1 – Layouts',
                name: `SS1: ${slot + 1}: ${name}`,
                type: 'button',
                style: { text: `SS1\n${slot + 1}: ${name}`, size: 'auto', color: 0xffffff, bgcolor: 0x1a1a2e },
                feedbacks: [
                    {
                        feedbackId: 'active_preset_ss0',
                        options: { preset: name },
                        style: { bgcolor: 0xcc0000, color: 0xffffff },
                    },
                ],
                steps: [
                    {
                        down: [{ actionId: 'load_preset_ss0', options: { preset: name, duration: '500', easing: 'linear' } }],
                        up: [],
                    },
                ],
            })
        } else {
            presets.push({
                category: 'SS1 – Layouts',
                name: `SS1: ${slot + 1}: Empty`,
                type: 'button',
                style: { text: `SS1\n${slot + 1}: Empty`, size: 'auto', color: 0x555555, bgcolor: 0x111111 },
                feedbacks: [],
                steps: [{ down: [], up: [] }],
            })
        }
    }

    // ── SS2 (ss1) Layout Presets ──────────────────────────────────────────────
    for (let slot = 0; slot < SLOTS; slot++) {
        const name = presetNames[slot]
        if (name) {
            presets.push({
                category: 'SS2 – Layouts',
                name: `SS2: ${slot + 1}: ${name}`,
                type: 'button',
                style: { text: `SS2\n${slot + 1}: ${name}`, size: 'auto', color: 0xffffff, bgcolor: 0x1a2e1a },
                feedbacks: [
                    {
                        feedbackId: 'active_preset_ss1',
                        options: { preset: name },
                        style: { bgcolor: 0xcc0000, color: 0xffffff },
                    },
                ],
                steps: [
                    {
                        down: [{ actionId: 'load_preset_ss1', options: { preset: name, duration: '500', easing: 'linear' } }],
                        up: [],
                    },
                ],
            })
        } else {
            presets.push({
                category: 'SS2 – Layouts',
                name: `SS2: ${slot + 1}: Empty`,
                type: 'button',
                style: { text: `SS2\n${slot + 1}: Empty`, size: 'auto', color: 0x555555, bgcolor: 0x111111 },
                feedbacks: [],
                steps: [{ down: [], up: [] }],
            })
        }
    }

    // ── SS1 (ss0) Save Preset ─────────────────────────────────────────────────
    presets.push({
        category: 'SS1 – Layouts',
        name: 'SS1: Save Preset',
        type: 'button',
        style: { text: 'SS1\nSAVE\nPRESET', size: 'auto', color: 0xffffff, bgcolor: 0x2a1a00 },
        feedbacks: [],
        steps: [
            {
                down: [{ actionId: 'save_preset_ss0', options: { name: '' } }],
                up: [],
            },
        ],
    })

    // ── SS2 (ss1) Save Preset ─────────────────────────────────────────────────
    presets.push({
        category: 'SS2 – Layouts',
        name: 'SS2: Save Preset',
        type: 'button',
        style: { text: 'SS2\nSAVE\nPRESET', size: 'auto', color: 0xffffff, bgcolor: 0x002a00 },
        feedbacks: [],
        steps: [
            {
                down: [{ actionId: 'save_preset_ss1', options: { name: '' } }],
                up: [],
            },
        ],
    })

    // ── SS1 (ss0) Box Controls ────────────────────────────────────────────────
    for (let i = 0; i < 4; i++) {
        presets.push({
            category: 'SS1 – Box Controls',
            name: `SS1: Box ${i + 1} Large`,
            type: 'button',
            style: {
                text: `SS1\nBOX ${i + 1}\nLARGE`,
                size: 'auto',
                color: 0xffffff,
                bgcolor: 0x003366,
            },
            feedbacks: [
                {
                    feedbackId: 'box_large_ss0',
                    options: { box: String(i) },
                    style: {
                        bgcolor: 0xcc0000,
                        color: 0xffffff,
                    },
                },
            ],
            steps: [
                {
                    down: [
                        {
                            actionId: 'box_large_ss0',
                            options: { box: String(i), duration: '500', easing: 'linear' },
                        },
                    ],
                    up: [],
                },
            ],
        })
    }

    presets.push({
        category: 'SS1 – Box Controls',
        name: 'SS1: Return',
        type: 'button',
        style: {
            text: 'SS1\nRETURN',
            size: 'auto',
            color: 0xffffff,
            bgcolor: 0x333333,
        },
        feedbacks: [],
        steps: [
            {
                down: [
                    {
                        actionId: 'return_ss0',
                        options: { duration: '500', easing: 'linear' },
                    },
                ],
                up: [],
            },
        ],
    })

    // ── SS2 (ss1) Box Controls ────────────────────────────────────────────────
    for (let i = 0; i < 4; i++) {
        presets.push({
            category: 'SS2 – Box Controls',
            name: `SS2: Box ${i + 1} Large`,
            type: 'button',
            style: {
                text: `SS2\nBOX ${i + 1}\nLARGE`,
                size: 'auto',
                color: 0xffffff,
                bgcolor: 0x003366,
            },
            feedbacks: [
                {
                    feedbackId: 'box_large_ss1',
                    options: { box: String(i) },
                    style: {
                        bgcolor: 0xcc0000,
                        color: 0xffffff,
                    },
                },
            ],
            steps: [
                {
                    down: [
                        {
                            actionId: 'box_large_ss1',
                            options: { box: String(i), duration: '500', easing: 'linear' },
                        },
                    ],
                    up: [],
                },
            ],
        })
    }

    presets.push({
        category: 'SS2 – Box Controls',
        name: 'SS2: Return',
        type: 'button',
        style: {
            text: 'SS2\nRETURN',
            size: 'auto',
            color: 0xffffff,
            bgcolor: 0x333333,
        },
        feedbacks: [],
        steps: [
            {
                down: [
                    {
                        actionId: 'return_ss1',
                        options: { duration: '500', easing: 'linear' },
                    },
                ],
                up: [],
            },
        ],
    })

    // ── Advanced Mode Toggles ─────────────────────────────────────────────────
    presets.push({
        category: 'SS1 – Box Controls',
        name: 'SS1: Advanced Mode Toggle',
        type: 'button',
        style: {
            text: 'SS1\nADV\nMODE',
            size: 'auto',
            color: 0xffffff,
            bgcolor: 0x2a2a4a,
        },
        feedbacks: [
            {
                feedbackId: 'advanced_mode_ss0',
                options: {},
                style: {
                    bgcolor: 0xcc0000,
                    color: 0xffffff,
                },
            },
        ],
        steps: [
            {
                down: [
                    {
                        actionId: 'advanced_mode_ss0',
                        options: { enabled: 'toggle' },
                    },
                ],
                up: [],
            },
        ],
    })

    presets.push({
        category: 'SS2 – Box Controls',
        name: 'SS2: Advanced Mode Toggle',
        type: 'button',
        style: {
            text: 'SS2\nADV\nMODE',
            size: 'auto',
            color: 0xffffff,
            bgcolor: 0x2a2a4a,
        },
        feedbacks: [
            {
                feedbackId: 'advanced_mode_ss1',
                options: {},
                style: {
                    bgcolor: 0xcc0000,
                    color: 0xffffff,
                },
            },
        ],
        steps: [
            {
                down: [
                    {
                        actionId: 'advanced_mode_ss1',
                        options: { enabled: 'toggle' },
                    },
                ],
                up: [],
            },
        ],
    })

    return presets
}
