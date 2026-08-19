# RealVoice architecture

## Product boundary
RealVoice is a mobile-first voice laboratory. The foundation UI is provider-agnostic: the audio engine will be connected later through a server-side speech-to-speech adapter.

## Audio pipeline
1. Capture or import user audio.
2. Detect/separate the primary speaker while preserving the environmental bed.
3. Convert speaker characteristics using a licensed/consented speech-to-speech voice model.
4. Recombine converted speech with the original environment.
5. Preview, export, or share the resulting audio.

## App layers
- `src/main.js`: presentation shell and interaction state.
- `src/styles.css`: visual system.
- `src/engine/`: future browser/native audio adapters; no provider SDK belongs in UI code.
- `src/services/`: future API clients using server endpoints only.
- `server/`: future provider gateway, authentication, rate limits, and job orchestration.

## Security
Provider secrets must never ship to the client. The eventual server gateway will own API credentials, usage limits, abuse controls, logging, and provider selection.

## Important Android constraint
The product does not assume that a normal Android app can replace another app's microphone stream. Initial sharing is designed around processed recordings/audio assets. Live cross-app microphone support is a separate compatibility project.

## Voice library
Only original, licensed, public-domain, or explicitly consented target voices should be offered. Do not clone a real person's identity without appropriate permission.
