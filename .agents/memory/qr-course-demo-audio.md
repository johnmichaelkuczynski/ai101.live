---
name: qr-course-demo audio decisions
description: Demo video audio = background music ONLY; narration voiceover was removed by user request
---

# Demo video audio (qr-course-demo VideoTemplate.tsx)

**Decision: the demo video uses background music ONLY. Do NOT add TTS/narration voiceover.**
**Why:** the user found the synthetic/TTS narration voice unacceptable ("robotic ... sounds like shit") and explicitly asked for just music + the app at work. Narration was added in an earlier session, then ripped back out.
**How to apply:** keep a single `<audio>` (`bg_music.mp3`, volume ~0.55, seeked by `SCENE_START_SEC` on scene change). The per-scene `narration_s1..s6.mp3` files and the `narrationRef`/narration effect were deleted. If asked to add voice again, confirm voice choice first — do not reach for the default TTS.

**Surviving gotcha (still relevant for any per-scene media):** a scene-synced media effect that resets `src`/`currentTime=0` must depend ONLY on the scene key, never on `muted`. If `muted` is in the deps, toggling mute mid-scene re-runs the effect and restarts playback. Handle mute declaratively via `<audio muted={muted}>`.
