const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const axios = require('axios')
const { getActions } = require('./actions')
const { getFeedbacks } = require('./feedbacks')
const { getVariables } = require('./variables')
const { getPresets } = require('./companion-presets')

class SSRCAnimatorInstance extends InstanceBase {
    constructor(internal) {
        super(internal)
        this.config = {}
        this.state = {
            0: { preset: null, boxes: null },
            1: { preset: null, boxes: null },
        }
        this.presets = {}
        this.ws = null
    }

    async init(config) {
        this.config = config
        this.updateStatus(InstanceStatus.Ok, 'Initializing')

        await this.updatePresetList()
        this.setupActions()
        this.setupFeedbacks()
        this.setupVariables()
        this.setupPresets()
        this.connectWebSocket()

        this.updateStatus(InstanceStatus.Ok, 'Connected')
    }

    async configUpdated(config) {
        this.config = config
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
        await this.updatePresetList()
        this.setupActions()
        this.setupFeedbacks()
        this.setupPresets()
        this.connectWebSocket()
    }

    async updatePresetList() {
        try {
            const response = await axios.get(`http://${this.config.host}:${this.config.port}/api/presets`)
            this.presets = response.data
            this.log('debug', `Loaded ${Object.keys(this.presets).length} presets`)
        } catch (err) {
            this.log('error', `Failed to load presets: ${err.message}`)
            this.updateStatus(InstanceStatus.Error, 'Failed to load presets')
        }
    }

    connectWebSocket() {
        if (this.ws) return

        const wsUrl = `ws://${this.config.host}:${this.config.port}`
        try {
            this.ws = new (require('ws'))(wsUrl)

            this.ws.on('open', async () => {
                this.log('debug', 'WebSocket connected')
                this.updateStatus(InstanceStatus.Ok, 'Connected')
                await this.updatePresetList()
                this.setupActions()
                this.setupFeedbacks()
                this.setupPresets()
            })

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data)
                    if (message.type === 'state') {
                        this.state = message.state
                        this.checkFeedbacks('active_preset_ss0', 'active_preset_ss1', 'box_large_ss0', 'box_large_ss1', 'advanced_mode_ss0', 'advanced_mode_ss1')
                        this.updateVariables()
                    } else if (message.type === 'stateChange') {
                        this.state[message.ssId] = message.state
                        this.checkFeedbacks('active_preset_ss0', 'active_preset_ss1', 'box_large_ss0', 'box_large_ss1', 'advanced_mode_ss0', 'advanced_mode_ss1')
                        this.updateVariables()
                    }
                } catch (err) {
                    this.log('error', `WebSocket message error: ${err.message}`)
                }
            })

            this.ws.on('close', () => {
                this.log('debug', 'WebSocket disconnected')
                this.ws = null
                setTimeout(() => this.connectWebSocket(), 3000)
            })

            this.ws.on('error', (err) => {
                this.log('error', `WebSocket error: ${err.message}`)
                this.updateStatus(InstanceStatus.ConnectionFailure, 'WebSocket error')
            })
        } catch (err) {
            this.log('error', `Failed to create WebSocket: ${err.message}`)
        }
    }

    setupActions() {
        this.setActionDefinitions(getActions(this))
    }

    setupFeedbacks() {
        this.setFeedbackDefinitions(getFeedbacks(this))
    }

    setupPresets() {
        this.setPresetDefinitions(getPresets(this))
    }

    setupVariables() {
        this.setVariableDefinitions(getVariables())
        this.updateVariables()
    }

    updateVariables() {
        this.setVariableValues({
            'ss0_preset': this.state[0].preset || 'None',
            'ss1_preset': this.state[1].preset || 'None',
        })
    }

    async handleAction(action) {
        try {
            const url = `http://${this.config.host}:${this.config.port}${action.endpoint}`
            const response = await axios.post(url, action.body || {})
            if (!response.data.ok) {
                throw new Error(response.data.error || 'Request failed')
            }
        } catch (err) {
            this.log('error', `Action failed: ${err.message}`)
            throw err
        }
    }

    async destroy() {
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }

    getConfigFields() {
        return [
            {
                type: 'textinput',
                id: 'host',
                label: 'Host',
                width: 12,
                default: 'localhost',
            },
            {
                type: 'textinput',
                id: 'port',
                label: 'Port',
                width: 12,
                default: '9876',
                regex: Regex.PORT,
            },
        ]
    }
}

module.exports = SSRCAnimatorInstance
runEntrypoint(module.exports)
