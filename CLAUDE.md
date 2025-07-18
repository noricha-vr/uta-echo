# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

うたエコー (Uta Echo) is a browser-based real-time karaoke effect application built with React, TypeScript, and Web Audio API. It processes microphone input with various audio effects and allows users to record and save their performances.

## Development Commands

### Local Development
```bash
# Install dependencies (use either bun or npm)
bun install
# or
npm install

# Start development server (HTTP only, runs on http://localhost:5173)
bun run dev
# or
npm run dev

# Build for production
bun run build
# or
npm run build

# Run linting
bun run lint
# or
npm run lint

# Preview production build
bun run preview
# or
npm run preview
```

### Docker Development (HTTPS)
```bash
# Start with HTTPS support (required for microphone access)
docker compose up

# Access at https://localhost (uses self-signed certificate)
```

## Architecture Overview

### Core Services
- **AudioEngine** (`src/services/AudioEngine.ts`): Manages Web Audio API nodes, effect chains, and recording functionality. Central audio processing engine.
- **StorageManager** (`src/services/StorageManager.ts`): Handles IndexedDB operations for storing recordings with a 100MB limit.

### Component Structure
- **App.tsx**: Main component managing application state, audio engine lifecycle, and user permissions
- **AudioControls**: Microphone controls, gain adjustment, preset selection, and recording interface
- **EffectPanel**: Effect chain management with parameter controls for each audio effect
- **RecordingHistory**: List and playback interface for saved recordings
- **Visualizer**: Real-time audio waveform visualization

### Audio Effects System
The application implements 9 audio effects using Web Audio API nodes:
- Effects are chained together with wet/dry mix controls
- Each effect has specific parameters that can be adjusted in real-time
- Presets combine multiple effects with predefined settings

### Data Flow
1. Microphone input → AudioEngine → Effect chain → Output/Recording
2. Recordings → IndexedDB (via Dexie.js) → MP3 conversion (lamejs) → Download

## Key Technical Considerations

- **HTTPS Requirement**: Microphone access requires HTTPS. Docker setup provides this with Caddy reverse proxy.
- **Browser Compatibility**: Optimized for Chrome. Uses modern Web Audio API features.
- **State Management**: React hooks with centralized state in App component.
- **Audio Processing**: Real-time processing with Web Audio API nodes, no external audio libraries except lamejs for MP3 encoding.
- **Storage**: IndexedDB with 100MB limit, automatic storage management.

## File Naming Conventions
- Components: PascalCase (e.g., `AudioControls.tsx`)
- Services: PascalCase classes (e.g., `AudioEngine.ts`)
- Utilities: camelCase (e.g., `audioConverter.ts`)
- Types: Centralized in `src/types/index.ts`