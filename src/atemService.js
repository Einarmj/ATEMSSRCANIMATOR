const { Atem } = require('atem-connection');

class AtemService {
    constructor() {
        this.atem = new Atem();
        this.connected = false;
        this.superSourceCount = 0;
        this.localState = { 0: null, 1: null };

        this.atem.on('connected', () => {
            this.connected = true;
            console.log('ATEM connected');
            setTimeout(() => {
                try {
                    this.superSourceCount = this.atem.state.info?.capabilities?.superSources ?? 2;
                    console.log(`ATEM has ${this.superSourceCount} SuperSource(s)`);

                    const { setActivePreset } = require('./layoutLogic');
                    for (let i = 0; i < this.superSourceCount; i++) {
                        this.localState[i] = this._readFromAtem(i);
                        console.log(`Seeded SS${i}:`, JSON.stringify(this.localState[i]));
                        setActivePreset(i, this.localState[i]);
                    }
                } catch (e) {
                    console.error('Failed to seed state:', e);
                }
            }, 1000);
        });

        this.atem.on('disconnected', () => {
            this.connected = false;
            console.log('ATEM disconnected');
        });

        this.atem.on('error', (err) => {
            console.error('ATEM error:', err);
        });
    }

    async connect(ip) {
        console.log('Connecting to ATEM at', ip);
        await this.atem.connect(ip);
    }

    _readFromAtem(ssId) {
        const ss = this.atem.state.video.superSources[ssId];
        if (!ss) throw new Error(`SuperSource ${ssId} not available`);
        const boxes = [];
        for (let i = 0; i < 4; i++) {
            const b = ss.boxes[i];
            boxes.push({
                enabled: b.enabled,
                source: b.source,
                x: b.x,
                y: b.y,
                size: b.size,
                cropped: b.cropped,
                cropTop: b.cropTop,
                cropBottom: b.cropBottom,
                cropLeft: b.cropLeft,
                cropRight: b.cropRight,
            });
        }
        return { boxes };
    }

    getSuperSourceCount() {
        return this.superSourceCount;
    }

    getSuperSourceState(ssId) {
        if (!this.localState[ssId]) {
            this.localState[ssId] = this._readFromAtem(ssId);
        }
        return this.localState[ssId];
    }

    applySuperSourceState(ssId, state) {
        this.localState[ssId] = JSON.parse(JSON.stringify(state));
        state.boxes.forEach((box, index) => {
            const props = {
                enabled: box.enabled,
                source: box.source,
                x: Math.round(box.x),
                y: Math.round(box.y),
                size: Math.round(box.size),
                cropped: box.cropped,
                cropTop: Math.round(box.cropTop),
                cropBottom: Math.round(box.cropBottom),
                cropLeft: Math.round(box.cropLeft),
                cropRight: Math.round(box.cropRight),
            };
            try {
                const result = this.atem.setSuperSourceBoxSettings(props, index, ssId);
                if (result && typeof result.then === 'function') {
                    result.catch(err => console.error(`setSuperSourceBoxSettings error for SS${ssId} box${index}:`, err));
                }
            } catch (err) {
                console.error(`setSuperSourceBoxSettings threw for SS${ssId} box${index}:`, err);
            }
        });
    }
    forceReseed(ssId) {
        try {
            this.localState[ssId] = this._readFromAtem(ssId);
            console.log(`Force reseeded SS${ssId}:`, JSON.stringify(this.localState[ssId]));
        } catch (e) {
            console.error(`Failed to reseed SS${ssId}:`, e);
        }
    }
}

module.exports = new AtemService();