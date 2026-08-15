---
name: api-server esbuild externals
description: Packages that break when bundled into the api-server dist
---
- The api-server bundles with esbuild (build.mjs). `pdfkit`/`fontkit` cannot be bundled — fontkit requires `@swc/helpers/cjs/*.cjs` at runtime and crashes with MODULE_NOT_FOUND. They are listed in the `external` array; keep any font/PDF libs external.
- **Why:** first restart after adding pdfkit failed at boot with this exact error.
- **How to apply:** if a new dependency crashes the bundled server with a nested-require MODULE_NOT_FOUND, add it (and its native/cjs deps) to `external` in build.mjs rather than fighting the bundler.
