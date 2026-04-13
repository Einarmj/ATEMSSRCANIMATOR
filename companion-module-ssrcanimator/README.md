# Companion Module for SSRCANIMATOR

This is a Bitfocus Companion module for controlling SSRCANIMATOR - an ATEM SuperSource layout animator.

> **Status:** This module is currently in development and not yet available in the official Companion module store. It will be released properly at a later date. For now, use the developer mode instructions below to load it manually.

## Installation via Developer Mode (Current Method)

Companion's developer mode lets you load modules directly from a local folder without waiting for an official release.

### Step 1 — Enable developer mode in Companion

1. Open the Companion web interface (usually `http://localhost:8888`)
2. Go to **Settings** (the gear icon in the sidebar)
3. Scroll down to find **Developer modules path**
4. Enter the full path to the folder that *contains* the module — this should be the parent folder, not the module folder itself. For example, if the module lives at `/Users/you/modules/companion-module-ssrcanimator`, enter `/Users/you/modules`
5. Click **Save** and restart Companion

### Step 2 — Install module dependencies

```bash
cd companion-module-ssrcanimator
npm install
```

### Step 3 — Add the instance in Companion

1. Go to **Connections** in the Companion sidebar
2. Click **Add connection**
3. Search for **SSRCANIMATOR** — it should appear under your dev modules
4. Click it, then configure the host and port (default: `localhost:3000`)
5. Click **Save**

### Step 4 — Updating the module

If you make changes to the module code, you need to restart Companion for them to take effect. There is no hot-reload in developer mode.

## Features

### Actions
- **Load Preset on SS0/SS1** - Load any saved preset with custom animation duration
- **Make Box Large on SS0/SS1** - Zoom in on a specific box (auto-uncrops)
- **Return to Preset on SS0/SS1** - Return to the active preset layout

### Feedback
- **Highlight if Preset Active** - Button highlights when a specific preset is active on the SuperSource

### Variables
- `$(ssrcanimator:ss0_preset)` - Currently active preset name on SS0
- `$(ssrcanimator:ss1_preset)` - Currently active preset name on SS1

## Requirements

- SSRCANIMATOR server running on accessible network (default: localhost:3000)
- Bitfocus Companion 2.0+
- Node.js 14+ (for development)

## Development

To test the module locally:

1. Set up your SSRCANIMATOR server
2. Update the host/port in Companion settings
3. Changes to the module code require Companion restart

## Configuration

### Instance Settings
- **Host** - IP address or hostname of SSRCANIMATOR server (default: localhost)
- **Port** - Port number of SSRCANIMATOR server (default: 3000)

## Troubleshooting

### Module not connecting
- Verify SSRCANIMATOR server is running: `npm start` in main directory
- Check host and port in Companion settings
- Look at Companion logs for connection errors

### Actions not working
- Verify presets exist in SSRCANIMATOR
- Check that ATEM is connected and has SuperSource enabled
- Review SSRCANIMATOR server logs for errors

### WebSocket issues
- Ensure firewall allows WebSocket connections on the SSRCANIMATOR port
- Check SSRCANIMATOR server logs for connection details
