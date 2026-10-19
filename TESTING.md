# Verification record

## Passed

- `npm run build`: strict TypeScript check and Vite production build.
- `npm run lint`: no errors or warnings.
- `npm test`: 16 passing Vitest tests.
- `npm ls --depth=0`: installed dependency tree resolves without peer errors.
- Sample assets: all 12 full-resolution photographs and 12 thumbnails are present locally.

Unit coverage includes Fisher–Yates permutations, reproducibility, input immutability, 0/1/12/100/1,000-photo collections, spacing/route clearance, duplicate IDs, stable revisiting, discovery coverage, save validation, corrupt/stale saves, and real Three.js camera-frustum coverage at desktop (1440×900) and mobile (390×844) aspect ratios.

Vite emits a size advisory for the Three.js renderer chunk (about 316 kB gzip). The renderer is split from the UI, and photo/environment rendering uses visibility windows. Runtime frame rate has not been measured here.

## Blocked in this workspace

- Browser launch: Chromium failed with macOS sandbox `bootstrap_check_in ... Permission denied (1100)`. No browser screenshot, visual acceptance, or browser interaction pass is claimed.
- Local preview: Vite could not bind `127.0.0.1:5173` (`listen EPERM`). Start the app in your own terminal using `npm run dev`.
- Git initialization: creation of `.git` was denied by the workspace sandbox. Source files and `.gitignore` are ready; run `git init` outside the restricted agent environment if desired.

Dependencies were installed from a locally populated npm cache because the agent's npm network access was restricted. The checked-in lockfile uses normal public registry URLs; no machine-specific cache configuration is required.

## Browser checks to run locally

```sh
npx playwright install chromium
npm run test:e2e
```

The included Playwright suite exercises entry, an actual projected 3D photo click, mouse-wheel movement, no document scroll, backward keyboard movement, accessible photo inspection/Escape, optional audio, saved journey reload, mobile touch movement, help dialog, journey ending/walk back, reduced motion, and the WebGL fallback. It writes screenshots to `test-results/` when run. It has not been executed successfully in this sandbox.

Before publishing, also inspect the experience at 390×844, 768×1024, 1280×720, and 1440×900. Check:

1. Forest depth, composition, photo legibility, fog and overall brightness.
2. Wheel, W/S, arrows, touch swipes, horizontal look, auto walk and on-screen controls.
3. Photo dialog focus, Escape, image aspect ratios and camera position after closing.
4. All memories discovered, walk back, then explicit reshuffle on completion. An incomplete journey offers to locate missing memories before restarting.
5. A blocked/invalid photo request: paper frame remains and inspection reports the missing image.
6. Physical mobile devices, rotation, low-end GPU frame rate and background-tab audio behavior.
7. Custom empty, single-photo and large manifests in the real renderer; the algorithms are already covered by unit tests.
