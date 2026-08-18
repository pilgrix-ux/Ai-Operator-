# 3D Shooter Architecture

## Client

The game client owns presentation, input, camera, animation, local prediction, HUD, audio and effects.

## Gameplay core

The gameplay layer owns weapon definitions, health, damage, movement rules, abilities, match state, scoring and respawn. Keep these systems deterministic and independent of UI.

## Networking

Use an authoritative-server model for competitive matches. Clients send player intent; the server validates movement, firing, damage, scoring and match results.

## Content

Keep characters, weapons, maps, abilities and progression data-driven. This lets us add content without changing gameplay code.

## Mobile performance

Target low/mid-range Android first: pooled projectiles/effects, limited dynamic lights, baked/static environment lighting where appropriate, LODs, compressed textures, capped particle counts and predictable network payloads.

## First vertical slice

One arena + one player + one rifle + one bot + health/damage + respawn + score + mobile HUD. Do not build monetization or matchmaking until this loop feels excellent.
