# Memory Forest

A first-person, full-screen 3D journey through hanging photographs. Scroll moves the camera through a procedural forest; it never scrolls the document. React + TypeScript, Vite, Three.js, React Three Fiber/Drei, Tailwind CSS, Framer Motion and Lucide.

## Run

Node 22.12+ recommended (also works with Node 24).

```sh
npm install
npm run dev
```

Open the printed local URL, normally http://localhost:5173.

```sh
npm test          # shuffle, placement, persistence and discovery logic
npm run lint
npm run build    # strict TypeScript and production bundle
npm run preview
npx playwright install chromium
npm run test:e2e  # browser navigation, inspection, persistence, mobile controls
```

## Add your photographs

1. Add full-resolution images to `public/photos/`.
2. Optionally add smaller 480–640px thumbnails for the 3D scene.
3. Edit `src/data/photos.ts`, using a unique, stable `id` for every photograph:

```ts
{ id: 'kandy-2025', src: '/photos/kandy.jpg', thumbnail: '/photos/kandy-small.jpg',
  title: 'A Beautiful Day', caption: 'A moment we wanted to keep.',
  date: '2025-08-12', location: 'Kandy' }
```

Only `id` and `src` are required. Images retain their natural aspect ratios; both portraits and landscapes fit inside printed borders. JPEG, PNG and WebP work. Use compressed JPEG/WebP files for larger collections. No scene code needs to change. Vite refreshes development changes automatically; rebuild for production. Empty manifests display an invitation to add photos. Duplicate IDs are rejected because they would break journey guarantees.

The manifest is the data boundary for future storage or backend integration. Sample captions/dates/locations are fictional and are not claims about the stock photographs. All photo files are bundled locally. The optional download helper is only for restoring the included samples; production makes no external image requests. Original photo identifiers are listed in `scripts/download-samples.sh`. Photography source: Unsplash, https://unsplash.com/license.

## Controls

- Wheel down/up, W/S, or arrow up/down: move forward/back.
- Move the mouse: gently look around.
- On a phone: swipe up/down to walk; drag sideways to look.
- On-screen arrows provide an alternative to wheel/touch controls.
- Click a photograph or one of the **Along the path** titles to inspect it. The HTML titles also make memories keyboard accessible.
- Space toggles auto walk when focus is outside a button. The auto-walk button is always available.
- Escape closes a dialog, then leaves exploration. **Leave the forest** also returns to the introduction.
- Sound is opt-in. Fullscreen appears only where supported.

Native HTML dialogs trap focus while open, support Escape, and restore focus on close. Walking stops at exactly the same position during inspection. Opening a memory pauses auto walk; resume explicitly when ready.

## Journey guarantees

`src/utils/journey.ts` provides a seeded PRNG and a Fisher–Yates permutation. Each photograph appears once in the generated layout. Alternating sides, controlled spacing, heights and slight rotations vary the composition while reserving a clear walking route. Reversing direction never changes the seed or layout.

Discovery checks the actual camera frustum and a nearby depth range, independently of journey order. A `Set` counts each ID once. Opening a photo via accessible controls also discovers it. At the end, the visitor can walk back or explicitly start a new shuffled journey. If some memories were missed while looking away, the ending says so instead of claiming completion.

The seed, sequence IDs, discovered IDs and distance are saved to localStorage every 1.5 seconds and on page exit. Invalid/stale saves are discarded when the manifest changes. Storage denial does not prevent use. To clear a saved journey, remove `memory-forest.journey.v1` from browser storage.

## Rendering and performance

- Instanced fairy-light bulbs, trunks, branches, foliage, rocks and grass in a moving five-chunk window.
- Nearby photo meshes only (roughly 12 units behind / 45 ahead), so thumbnails load ahead of arrival.
- Texture ownership is per mounted print; GPU textures are disposed on removal. Browser HTTP caching avoids downloading an unchanged image again. Full-resolution files load only in the inspection dialog.
- One directional light, ambient/hemisphere lighting, emissive bulbs; no expensive real-time shadows or post-processing chain.
- DPR is capped at 1.5 on desktop, 1 on smaller screens, and falls to 1 when performance declines.
- Animation uses refs and frame delta; React updates only for discovery/chunk changes, not every frame.
- Reduced-motion removes walking sway, photo sway and particles. Normal navigation remains available.
- WebGL-unavailable browsers receive an accessible HTML story list. Image failures leave a paper frame and explanatory inspection state.

This is a stylized procedural forest, not a photogrammetry scene. Physical mobile device testing is still valuable, especially on older GPUs.

## Audio

`public/audio/forest-ambient.wav` is an original generated ambient chord (no third-party music license needed), created by `scripts/generate-audio.py`. Replace that file or change the source in `src/components/ui/AudioControl.tsx`. Volume defaults to 20%, playback starts only from the sound button, and pauses in a hidden tab. If playback fails, the interface reports that audio is unavailable.

## Structure

- `components/forest`: camera, environment, hanging photographs, scene boundary.
- `components/ui`: accessible photo viewer and optional audio.
- `hooks/useMemoryJourney.ts`: persisted journey state.
- `utils/journey.ts`: pure deterministic shuffle/layout/validation algorithms.
- `data/photos.ts`: replaceable photo manifest.
- `tests`: unit tests and browser acceptance checks.

## Deploy

This application is entirely static. No secrets, API keys, account system, or paid services are required.

**Vercel:** import the repository; use the Vite preset, `npm run build`, and `dist` as output. `vercel.json` is included.

**Netlify:** import the repository; the included `netlify.toml` sets build/output and the SPA fallback.

**Other hosting:** upload the contents of `dist/`. Serve at the domain root, or configure Vite's `base` and photo URL prefixes for a subdirectory.

No production deployment is performed by the local build.

## Verification status

Build, lint, and all 16 unit tests pass. Browser rendering/interaction checks could not run because this workspace blocks Chromium launch and local server binding. See `TESTING.md` for the evidence, exact limits, and the local browser checklist. Git initialization is also restricted here; run `git init` in your terminal to start version control.
