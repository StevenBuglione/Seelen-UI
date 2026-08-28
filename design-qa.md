# Product Design QA — Omarchy shell baseline

## Evidence

- Source visual truth:
  - `D:\Temp\codex-omarchy-reference-20260827\themes\vantablack\preview.png`
  - `D:\Temp\codex-omarchy-reference-20260827\manual\images\navigation-dwindle-layout.webp`
- Implementation screenshot:
  - `D:\Users\steve\appsandbox\agent-os\agent-os-shell\tools\shell-studio\tests\visual\shell.visual.spec.ts-snapshots\shell-vantablack-none-chromium-win32.png`
- Full-view combined comparison:
  - `D:\Temp\agent-os-omarchy-comparison-pass3.png`
- Focused implementation state comparison:
  - `D:\Temp\agent-os-shell-state-contact-sheet.png`
- Focused top-bar reference comparison after icon-alignment correction:
  - `D:\Temp\agent-os-topbar-reference-pass4.png`
- Focused top-bar reference comparison after center-readout correction:
  - `D:\Temp\agent-os-topbar-reference-pass5.png`
- State: Vantablack theme, Build workspace, dwindle layout, normal motion, one monitor, desktop plus all five contextual
  panels.
- CSS viewport: 1366 x 768 shell preset inside the 1440 x 1000 Studio test viewport.
- Browser capture density: device scale factor 1.
- Source pixels: 1800 x 1012. Implementation pixels: 1140 x 641 for the element snapshot.
- Normalization: the source was bicubic-resized to 1140 x 641 and placed beside the unchanged 1140 x 641 implementation
  screenshot. Both are 16:9 content regions; the 12-pixel separator is outside both captures.

## Full-view comparison

The pass-three combined image compares the actual Vantablack preview with the browser-rendered Studio shell in one
input. Both use a near-black monochrome palette, a thin left/center/right top bar, numbered workspaces, narrow gaps and
keylines, one master window with a right-side dwindle stack, dense terminal/editor content, and subdued window chrome.
The implementation uses the pinned Omarchy wallpaper asset and exact Vantablack palette values.

The visual hierarchy now reads as a desktop shell, not a dashboard or assistant UI. The production substrate difference
is intentional: Omarchy's Linux apps and Quickshell surfaces are represented by Windows-native Svelte/Seelen contracts,
not copied or executed.

## Focused-region comparison

The six-state contact sheet was inspected at original resolution for the top bar, launcher, calendar, quick settings,
notifications, and workspace overview. The focused pass-four and pass-five comparisons place the normalized Omarchy bar
and corrected Studio bar in one image at 2x inspection scale. They verify centered icon and center-readout geometry,
consistent panel anchoring, keylines, radius, blur, icon stroke, compact typography, active state, and Vantablack token
use. The repository does not provide same-viewport screenshots of every Quickshell panel at the pinned revision, so
panel QA is based on visible Vantablack preview language plus the pinned bar, theme, and shell contracts rather than
false pixel-level claims.

## Required fidelity surfaces

- Fonts and typography: Omarchy's compact density and hierarchy are preserved. Segoe UI Variable is used for the Windows
  shell and Cascadia Code for terminal/editor content instead of requiring Linux fonts. Weights, line heights, labels,
  and truncation remain legible at the tested size.
- Spacing and layout rhythm: the bar is edge-to-edge, gaps are narrow, the dwindle ratio matches the Omarchy navigation
  reference, and panels align to their triggering bar zones. No clipping or dead desktop region remains.
- Colors and visual tokens: all Vantablack foreground, background, muted, selection, and accent values come from the
  pinned `colors.toml`. The other 21 palettes use the same semantic mapping.
- Image quality and asset fidelity: the wallpaper is the unmodified Omarchy source asset at its original bytes. Visible
  icons are generated Lucide SVG assets from the repository's existing icon dependency; no emoji, handcrafted SVG, CSS
  illustration, or placeholder image replaces source imagery.
- Copy and content: desktop content uses realistic Agent OS shell development data, identifies the pinned Omarchy
  source, and avoids user-facing implementation prompts or generic AI dashboard language.

## Interaction and accessibility evidence

- In-app browser tested launcher, quick settings, overview, all workspace controls, theme switching, and layout
  switching.
- Automated interaction coverage tests every bar panel, Escape dismissal, launcher filtering and launch feedback, all 26
  deferred Agent fixtures, viewport/DPI controls, two-monitor fixture behavior, focus visibility, and deterministic
  replay.
- Six shell ARIA snapshots cover desktop and every contextual panel.
- Reduced motion is wired to remove long transitions and repeating animations.
- Browser console check reported only Vite connection/debug events: zero warnings and zero errors.

## Comparison history

### Pass 1 — blocked

- [P1] Nested shell layout inherited the Studio's global `main` grid and compressed all windows into the left quarter.
  Fix: scoped the Studio grid to `.studio > main`, restoring the desktop's full-width dwindle tree.
- [P2] The bar was a large inset rounded capsule and the mock windows were substantially sparser than the Omarchy
  source. Fix: changed the bar to a thin edge-to-edge surface, tightened the desktop inset, and added realistic
  terminal, editor, and repository content.

### Pass 2 — passed

The post-fix combined comparison shows the earlier P1/P2 differences resolved. No actionable P0, P1, or P2 finding
remains.

### Pass 3 — passed after human-feedback correction

- [P2] The first reviewed bar still felt too tall at the Studio viewport, and its control focus/active treatment could
  visually cross the bar keyline. Fix: reduced the bar from 26 to 20 pixels, reduced control surfaces from 24 to 18
  pixels, tightened icon and cluster spacing, moved contextual panels to the new bar baseline, and changed top-bar focus
  treatment to an inset one-pixel ring.
- The new side-by-side comparison confirms that the bar now matches the visual density of the pinned Omarchy preview.
  Control surfaces remain contained inside the bar with a visible accessibility focus state. No P0, P1, or P2 finding
  remains.

### Pass 4 — passed after icon-alignment correction

- [P2] The compacted controls inherited the Studio's global 31-pixel `min-height`, so their 18-pixel shell height did
  not control the rendered box and icons were vertically displaced. Fix: explicitly set the top-bar controls to an
  18-pixel minimum height and line height, and make workspace controls use grid centering.
- The focused reference comparison confirms that the launcher, notification, system, overview, and workspace icons are
  centered within the 20-pixel bar. The containment and focus treatment from pass three remain intact. No P0, P1, or P2
  finding remains.

### Pass 5 — passed after center-readout correction

- [P2] Wednesday, the time, and weather were vertically low while the other icons were already correct. A Studio-only
  fixture control reused the shell's `.clock-button` class, leaking a 10-pixel top margin into the shared shell preview.
  Fix: renamed the Studio control to `.fixture-clock-button` and preserved the shell's existing horizontal layout.
- The permanent geometry check now proves that the center group, clock, and weather midpoints match the 20-pixel bar
  midpoint within half a pixel. The focused source comparison confirms the corrected visual alignment without changing
  the left or right icon groups. No P0, P1, or P2 finding remains.

## Follow-up polish

- [P3] Omarchy does not provide matched screenshots for every contextual panel at this revision. A future disposable
  Omarchy VM capture set could enable pixel-level panel comparison without changing the current compatibility boundary.
- [P3] A later production milestone should validate the same density with real Windows application titles and extracted
  icons in a disposable environment; M02 intentionally uses deterministic browser fixtures.

## Final result

final result: passed
