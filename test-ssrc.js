// test-ssrc.js
const { Atem } = require('atem-connection');

const atem = new Atem();

atem.on('connected', async () => {
    console.log('Connected to ATEM');

    const superSources = atem.state.video.superSources;
    console.log('superSources keys:', Object.keys(superSources));

    for (const [id, ss] of Object.entries(superSources)) {
        console.log(`SuperSource ${id}:`);
        if (!ss || !ss.boxes) continue;
        ss.boxes.forEach((box, index) => {
            console.log(`  Box ${index}:`, box);
        });
    }

    process.exit(0);
});

atem.on('error', (err) => {
    console.error('ATEM error:', err);
});

atem.connect(process.env.ATEM_IP || '');
