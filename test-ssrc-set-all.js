const { Atem } = require('atem-connection');

const atem = new Atem();

// 1. Listen for the 'connected' event
atem.on('connected', () => {
    console.log('Connected to ATEM. Waiting for state sync...');

    // Give the library 1-2 seconds to receive the full state dump
    setTimeout(async () => {
        const state = atem.state;
        if (!state || !state.video || !state.video.superSources) {
            console.error('State not yet synchronized. Try increasing the timeout.');
            process.exit(1);
        }

        const superSources = state.video.superSources;
        const ssIds = Object.keys(superSources);
        console.log('Detected SuperSource IDs:', ssIds);

        for (const idStr of ssIds) {
            const ssId = parseInt(idStr);

            try {
                // Ensure we are sending to a valid box
                console.log(`Sending command to SS ${ssId}, Box 0...`);

                // setSuperSourceBoxSettings returns a Promise in modern versions
                await atem.setSuperSourceBoxSettings({
                    enabled: false
                }, ssId, 0);

                // NOTE: In some versions of the library, the signature is:
                // atem.setSuperSourceBoxSettings(ssId, boxId, { enabled: false })
                // Check your specific version's types if this fails.

                console.log(`Successfully sent command for SS ${ssId}`);
            } catch (err) {
                console.error(`Failed to update SS ${ssId}:`, err);
            }
        }

        // Wait for the round-trip update from the ATEM to reflect in local state
        setTimeout(() => {
            ssIds.forEach(id => {
                const box = atem.state.video.superSources[id].boxes[0];
                console.log(`Verified SS ${id} Box 0 enabled:`, box.enabled);
            });
            process.exit(0);
        }, 500);

    }, 2000); // 2 second buffer for state synchronization
});

atem.on('error', console.error);

atem.connect(process.env.ATEM_IP || '');