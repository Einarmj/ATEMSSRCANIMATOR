# Companion Module for SSRCANIMATOR

This is a Bitfocus Companion module for controlling SSRCANIMATOR - an ATEM SuperSource layout animator.

## Installation

1. Clone or copy this module to your Companion modules directory:
   ```bash
   ~/.bitfocus-companion/modules/companion-module-ssrcanimator
   ```

2. Install dependencies:
   ```bash
   cd companion-module-ssrcanimator
   npm install
   ```

3. Restart Bitfocus Companion

4. Add a new instance:
   - Go to **Settings > Instances**
   - Click **Add instance**
   - Search for **SSRCANIMATOR**
   - Configure the host and port (default: localhost:3000)

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
