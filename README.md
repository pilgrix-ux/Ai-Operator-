# RealVoice

RealVoice is a mobile-first voice laboratory focused on natural voice transformation while preserving the original environment.

## Current phase
Foundation UI + architecture only. Audio conversion is intentionally provider-agnostic and will be added behind a server-side gateway.

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

The project is Vite-based and deployable as a static web application on Vercel. Do not place provider API keys in `src/` or other client-side files.
