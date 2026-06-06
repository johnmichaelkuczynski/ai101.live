---
name: qr-course-demo narration/audio wiring
description: How scene-synced voiceover + bg music are wired in the demo video, and the mute-restart gotcha
---

# Demo video audio (qr-course-demo VideoTemplate.tsx)

Two `<audio>` elements: background music (`bg_music.mp3`, volume ~0.16, seeked by `SCENE_START_SEC`) and narration (per-scene clips `narration_s1..s6.mp3`).

**Rule:** the narration scene-sync effect must depend ONLY on the scene key, NOT on `muted`.
**Why:** if `muted` is in the deps, toggling mute mid-scene re-runs the effect, which resets `src` + `currentTime=0` and restarts the voiceover. Mute is handled declaratively via `<audio muted={muted}>`.
**How to apply:** any per-scene media that restarts-from-0 on scene change should key its effect on `currentSceneKey`/`baseSceneKey` only; handle volume/mute on the element or in a separate effect.

Narration clips are authored to fit each scene's duration budget (SCENE_DURATIONS). If a clip overruns, shorten the script or raise TTS `speed` and re-check with ffprobe before shipping.
