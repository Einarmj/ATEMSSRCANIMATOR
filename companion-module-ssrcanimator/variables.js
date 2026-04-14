const PRESET_SLOTS = 10

exports.getVariables = (presets = {}) => {
    const vars = [
        { variableId: 'ss0_preset', name: 'SS1: Current Active Preset' },
        { variableId: 'ss1_preset', name: 'SS2: Current Active Preset' },
    ]

    const count = Math.max(PRESET_SLOTS, Object.keys(presets).length)
    for (let i = 1; i <= count; i++) {
        vars.push({ variableId: `preset_${i}`, name: `Preset Slot ${i} Name` })
    }

    return vars
}

exports.getPresetSlotValues = (presets = {}) => {
    const names = Object.keys(presets)
    const count = Math.max(PRESET_SLOTS, names.length)
    const values = {}
    for (let i = 1; i <= count; i++) {
        values[`preset_${i}`] = names[i - 1] || ''
    }
    return values
}
