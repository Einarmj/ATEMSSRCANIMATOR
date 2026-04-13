# SSRC Animator

A web-based controller for animated ATEM SuperSource layout transitions. Create presets, animate smooth transitions between multi-box layouts, and integrate with Bitfocus Companion for broadcast automation.

> **AI-assisted code:** This project was written with the help of [Claude](https://claude.ai) by Anthropic. While it has been tested and works for its intended purpose, there may be bugs or edge cases that haven't been caught. Use it at your own risk, and feel free to open an issue if you run into problems.

---

## Features

- Animated transitions between SuperSource box layouts with configurable duration and easing
- Preset management — save, load, and delete custom layouts
- Advanced mode for layer-swapping in 2-box layouts
- Real-time WebSocket state synchronization across connected clients
- Support for 2 independent SuperSource banks (SS1 and SS2)
- [Bitfocus Companion](https://bitfocus.io/companion) module for control room integration

---

## Requirements

- Node.js 18+
- A Blackmagic ATEM switcher with SuperSource support on the same network

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/ssrcanimator.git
cd ssrcanimator
npm install
```

---

## Usage

Start the server:

```bash
npm start
```

Or in development mode with auto-reload:

```bash
npm run dev
```

The web UI is available at `http://localhost:3000`.

On first load, enter your ATEM's IP address and click **Connect**. Once connected, you can load presets and animate between layouts.

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the server listens on |

---

## API

The server exposes a REST API for programmatic control:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/connect` | Connect to ATEM `{ ip }` |
| `GET` | `/api/presets` | List all presets |
| `POST` | `/api/presets/save` | Save current state as preset `{ name, ssId }` |
| `POST` | `/api/presets/load` | Load a preset `{ name, durationMs?, easing?, ssId? }` |
| `DELETE` | `/api/presets/:name` | Delete a user preset |
| `GET` | `/api/easings` | List available easing functions |
| `GET` | `/api/layout/:ss` | Get current layout for SS0 or SS1 |
| `POST` | `/api/ss/:ss/box/:box/large` | Enlarge a box `{ durationMs?, easing? }` |
| `POST` | `/api/ss/:ss/return` | Return to active preset `{ durationMs?, easing? }` |
| `POST` | `/api/ss/:ss/advanced` | Toggle advanced mode `{ enabled? }` |

---

## Bitfocus Companion Module

A Companion module is included in the `companion-module-ssrcanimator/` directory.

```bash
cd companion-module-ssrcanimator
npm install
```

See [companion-module-ssrcanimator/README.md](companion-module-ssrcanimator/README.md) for setup instructions.

---

## Libraries Used

| Library | Version | Purpose |
|---|---|---|
| [atem-connection](https://www.npmjs.com/package/atem-connection) | ^3.9.0 | Core ATEM switcher protocol — handles all communication with the hardware |
| [express](https://expressjs.com) | ^5.2.1 | HTTP server and REST API |
| [ws](https://github.com/websockets/ws) | ^8.20.0 | WebSocket server for real-time state sync |
| [nodemon](https://nodemon.io) | ^3.1.14 | Development auto-reload (dev dependency) |

The `atem-connection` library is the foundation of this project — it provides a full TypeScript implementation of the ATEM protocol, including SuperSource box control, state change events, and connection management.

---

## License

MIT
