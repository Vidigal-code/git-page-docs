# Git Page Layouts

Canonical home of the official Git Page Docs layout themes. Any repository can
consume these layouts:

- **Official remote (default):** generated `gitpagedocs/config.json` files
  point at this folder's `layoutsConfig.json` and `templates/`.
- **Self-hosted:** generate `gitpagelayouts/` with
  `npx @gitpagedocs/cli --layoutconfig`, which sets local layout paths and disables
  the official source in your site config. If copying this folder manually, set
  `site.layoutsConfigPathOficial: false` and the corresponding local paths.

The source of truth is `v2/`. `v2/base.json` holds every value the layouts share
(typography, component sizes, dark/light defaults and the rules that derive control
colors from each palette), and `v2/layouts/<id>.json` holds only the layout's
identity, colors and the few values that differ. `npm run layouts:sync` expands
them into the full `templates/<id>.json` files (the format viewers read, unchanged)
and regenerates this catalog. Edit `v2/`, never `templates/`.

## Animated presets

The additional animated themes combine stars, meteor streaks, falling Matrix
characters, orbs, grids and waves. Each preset defines
`overrides.backgroundEffects` in its v2 source; expansion places
`backgroundEffects` at the template root. Synchronization also compiles these
presets into `cli/data/animated-layouts.mjs`, so local CLI generation offers the
same palettes and backgrounds without reading files outside its package.

Choose a theme with `site.ThemeDefault` or the theme selector. Customize speed,
colors, density and parallax through `site.backgroundEffects.overrides` or
`site.backgroundEffects.themes[themeId]` in `gitpagedocs/config.json`.
Resolution order is template, global overrides, then per-theme overrides;
`layers` replaces the full array. The master `site.backgroundEffects.enabled:
false` disables every background. All new presets honor reduced motion and
include a pause control. Existing themes retain their original appearance.

The catalog combines 64 original themes, 20 standalone animated presets and
20 additional parallax families with dark and light variants. Paired entries use
the same `supportsLightAndDarkModesReference`, allowing the mode toggle to switch
within the family. For example, choose `aurora-borealis-dark` or
`aurora-borealis-light`; customize either ID independently through `themes`.

Pause/resume appears beside the navigation lock in the documentation menu and in
the search-page header. A manual pause survives menu and theme changes.
`site.backgroundEffects.overrides.accessibility.showPauseButton` defaults to
`true`; `false` hides the button without disabling motion. Configure
`site.icons.BackgroundAnimationPause` and `BackgroundAnimationResume` with
`reactIcon`, `tag`, `size`, `colorDark` and `colorLight`;
`reactIcon: false` shows localized text. Use the master switch to disable effects.

## Files

- [`layoutsConfig.json`](layoutsConfig.json) — index of every layout.
- [`layoutsFallbackConfig.json`](layoutsFallbackConfig.json) — minimal fallback set.
- [`v2/base.json`](v2/base.json) — shared values and palette rules (source).
- [`v2/layouts/`](v2/layouts) — one small file per layout (source).
- [`templates/`](templates) — one full JSON theme template per layout (generated from `v2/`).
- [`docs/`](docs) — one markdown page per layout (generated).

## Layouts (124)

| Id | Name | Mode | Pair | Description |
| --- | --- | --- | --- | --- |
| [`matrix-dark`](docs/matrix-dark.md) | Matrix Dark | `dark` | `matrix-1` | Dark theme with neon green accents inspired by The Matrix |
| [`matrix-light`](docs/matrix-light.md) | Matrix Light | `light` | `matrix-1` | Light theme with green accents inspired by The Matrix |
| [`default`](docs/default.md) | Default Theme | `light` | — | Clean and minimal default theme |
| [`github-dark`](docs/github-dark.md) | GitHub Dark | `dark` | `github-1` | GitHub-inspired dark theme |
| [`github-light`](docs/github-light.md) | GitHub Light | `light` | `github-1` | GitHub-inspired light theme |
| [`cyberpunk-dark`](docs/cyberpunk-dark.md) | Cyberpunk Dark | `dark` | `cyberpunk-1` | Futuristic dark theme with neon pink and cyan accents |
| [`cyberpunk-light`](docs/cyberpunk-light.md) | Cyberpunk Light | `light` | `cyberpunk-1` | Futuristic light theme with bright pink and cyan accents |
| [`aurora-dark`](docs/aurora-dark.md) | Aurora Dark | `dark` | `aurora-1` | Modern dark theme with purple + cyan accents and glassy cards |
| [`aurora-light`](docs/aurora-light.md) | Aurora Light | `light` | `aurora-1` | Modern light theme with purple + teal accents and soft shadows |
| [`nord-dark`](docs/nord-dark.md) | Nord Dark | `dark` | `nord-1` | Calm Nord-inspired dark theme (icy blues, low contrast glare) |
| [`nord-light`](docs/nord-light.md) | Nord Light | `light` | `nord-1` | Calm Nord-inspired light theme (clean, readable, modern) |
| [`sunset-dark`](docs/sunset-dark.md) | Sunset Dark | `dark` | `sunset-1` | Warm dark theme with orange + pink accents (sunset vibe) |
| [`sunset-light`](docs/sunset-light.md) | Sunset Light | `light` | `sunset-1` | Warm light theme with orange + rose accents (soft, modern UI) |
| [`mono-dark`](docs/mono-dark.md) | Mono Pro Dark | `dark` | `mono-1` | Minimal dark theme with lime accent and high readability |
| [`mono-light`](docs/mono-light.md) | Mono Pro Light | `light` | `mono-1` | Minimal light theme with lime accent and clean surfaces |
| [`oceanic-dark`](docs/oceanic-dark.md) | Oceanic Dark | `dark` | `oceanic-1` | Deep ocean dark UI with cyan and blue accents |
| [`oceanic-light`](docs/oceanic-light.md) | Oceanic Light | `light` | `oceanic-1` | Clean ocean light UI with soft aqua accents |
| [`rose-dark`](docs/rose-dark.md) | Rose Dark | `dark` | `rose-1` | Elegant dark rose palette with pink highlights |
| [`rose-light`](docs/rose-light.md) | Rose Light | `light` | `rose-1` | Soft rose light theme for modern documentation |
| [`forest-dark`](docs/forest-dark.md) | Forest Dark | `dark` | `forest-1` | Moody forest dark theme with green accents |
| [`forest-light`](docs/forest-light.md) | Forest Light | `light` | `forest-1` | Fresh forest light theme with natural greens |
| [`graphite-dark`](docs/graphite-dark.md) | Graphite Dark | `dark` | `graphite-1` | Premium graphite dark interface with blue glow |
| [`graphite-light`](docs/graphite-light.md) | Graphite Light | `light` | `graphite-1` | Minimal graphite light interface with calm contrast |
| [`lava-dark`](docs/lava-dark.md) | Lava Dark | `dark` | `lava-1` | Bold dark magma palette with hot orange accents |
| [`lava-light`](docs/lava-light.md) | Lava Light | `light` | `lava-1` | Warm light lava palette with energetic contrast |
| [`skyline-dark`](docs/skyline-dark.md) | Skyline Dark | `dark` | `skyline-1` | Night skyline dark blue palette with neon cyan |
| [`skyline-light`](docs/skyline-light.md) | Skyline Light | `light` | `skyline-1` | Airy skyline light palette with cool blue accents |
| [`emerald-dark`](docs/emerald-dark.md) | Emerald Dark | `dark` | `emerald-1` | Dark emerald style with refined green contrast |
| [`emerald-light`](docs/emerald-light.md) | Emerald Light | `light` | `emerald-1` | Elegant emerald light style for readable docs |
| [`violet-dark`](docs/violet-dark.md) | Violet Dark | `dark` | `violet-1` | Modern violet dark gradient with vivid contrast |
| [`violet-light`](docs/violet-light.md) | Violet Light | `light` | `violet-1` | Violet light palette with smooth, modern highlights |
| [`amber-dark`](docs/amber-dark.md) | Amber Dark | `dark` | `amber-1` | Dark amber interface with rich golden accents |
| [`amber-light`](docs/amber-light.md) | Amber Light | `light` | `amber-1` | Warm amber light interface with soft gold tones |
| [`slate-dark`](docs/slate-dark.md) | Slate Dark | `dark` | `slate-1` | Professional slate dark theme for technical docs |
| [`slate-light`](docs/slate-light.md) | Slate Light | `light` | `slate-1` | Professional slate light theme with neutral tones |
| [`vscode-dark`](docs/vscode-dark.md) | VSCode Dark | `dark` | `vscode-1` | Visual Studio Code Dark+ theme with editor blue accents |
| [`vscode-light`](docs/vscode-light.md) | VSCode Light | `light` | `vscode-1` | Visual Studio Code Light+ theme with clean editor tones |
| [`midnight-dark`](docs/midnight-dark.md) | Midnight | `dark` | — | Deep navy canvas with electric-blue accents |
| [`sakura-light`](docs/sakura-light.md) | Sakura | `light` | — | Soft cherry-blossom pinks on a bright canvas |
| [`carbon-dark`](docs/carbon-dark.md) | Carbon | `dark` | — | Near-black graphite with crisp white accents |
| [`neon-noir-dark`](docs/neon-noir-dark.md) | Neon Noir | `dark` | — | Black canvas with magenta and cyan neon |
| [`arctic-light`](docs/arctic-light.md) | Arctic | `light` | — | Icy whites with cool glacier-blue accents |
| [`ember-dark`](docs/ember-dark.md) | Ember | `dark` | — | Charcoal canvas glowing with warm ember orange |
| [`sage-light`](docs/sage-light.md) | Sage | `light` | — | Calm sage greens on a warm cream canvas |
| [`cobalt-dark`](docs/cobalt-dark.md) | Cobalt | `dark` | — | Deep blue canvas with vivid cobalt highlights |
| [`plum-dark`](docs/plum-dark.md) | Plum | `dark` | — | Dark plum canvas with violet and rose accents |
| [`mint-light`](docs/mint-light.md) | Mint | `light` | — | Fresh mint greens on a clean light canvas |
| [`coral-light`](docs/coral-light.md) | Coral | `light` | — | Warm coral and peach on a soft light canvas |
| [`obsidian-dark`](docs/obsidian-dark.md) | Obsidian | `dark` | — | Volcanic black glass with teal highlights |
| [`lagoon-dark`](docs/lagoon-dark.md) | Lagoon | `dark` | — | Deep teal waters with bright cyan accents |
| [`marigold-light`](docs/marigold-light.md) | Marigold | `light` | — | Warm marigold amber on a bright canvas |
| [`orchid-dark`](docs/orchid-dark.md) | Orchid | `dark` | — | Dark canvas with orchid purple and pink |
| [`steel-dark`](docs/steel-dark.md) | Steel | `dark` | — | Cool steel grays with icy blue highlights |
| [`moss-dark`](docs/moss-dark.md) | Moss | `dark` | — | Dark forest canvas with mossy green accents |
| [`tangerine-light`](docs/tangerine-light.md) | Tangerine | `light` | — | Bright tangerine orange on a light canvas |
| [`indigo-dark`](docs/indigo-dark.md) | Indigo | `dark` | — | Deep indigo canvas with violet highlights |
| [`blush-light`](docs/blush-light.md) | Blush | `light` | — | Soft blush pinks on an airy light canvas |
| [`verdant-dark`](docs/verdant-dark.md) | Verdant | `dark` | — | Rich emerald greens on a dark canvas |
| [`crimson-dark`](docs/crimson-dark.md) | Crimson | `dark` | — | Dark canvas with bold crimson accents |
| [`azure-light`](docs/azure-light.md) | Azure | `light` | — | Open sky-blue accents on a bright canvas |
| [`sand-light`](docs/sand-light.md) | Sand | `light` | — | Warm desert sand and beige on light canvas |
| [`velvet-dark`](docs/velvet-dark.md) | Velvet | `dark` | — | Royal purple velvet with warm gold accents |
| [`duet-dark`](docs/duet-dark.md) | Duet Dark | `dark` | `duet-1` | Polarity-flipped ink duet: white pill controls and flat elevated cards on black |
| [`duet-light`](docs/duet-light.md) | Duet Light | `light` | `duet-1` | Black-and-white editorial duet: pill controls, flat 16px cards, ink footer band |
| [`astral-drift-dark`](docs/astral-drift-dark.md) | Astral Drift | `dark` | — | Cyan stars, slow meteors and violet atmospheric depth |
| [`starfall-cobalt-dark`](docs/starfall-cobalt-dark.md) | Starfall Cobalt | `dark` | — | Silver starfall across a deep cobalt sky |
| [`lunar-dust-light`](docs/lunar-dust-light.md) | Lunar Dust | `light` | — | Fine indigo stardust on a pale lunar surface |
| [`solar-sparks-dark`](docs/solar-sparks-dark.md) | Solar Sparks | `dark` | — | Golden sparks and warm solar halos |
| [`comet-trail-dark`](docs/comet-trail-dark.md) | Comet Trail | `dark` | — | Turquoise comet trails above a deep teal field |
| [`celestial-ice-light`](docs/celestial-ice-light.md) | Celestial Ice | `light` | — | Blue ice crystals and soft celestial ripples |
| [`nebula-violet-dark`](docs/nebula-violet-dark.md) | Nebula Violet | `dark` | — | Violet nebula clouds with distant starlight |
| [`meteor-copper-dark`](docs/meteor-copper-dark.md) | Meteor Copper | `dark` | — | Copper meteors crossing a charcoal sky |
| [`matrix-rain-dark`](docs/matrix-rain-dark.md) | Matrix Rain | `dark` | — | Green code rain with a restrained terminal grid |
| [`matrix-amber-dark`](docs/matrix-amber-dark.md) | Matrix Amber | `dark` | — | Amber terminal characters and a warm phosphor glow |
| [`matrix-cyan-dark`](docs/matrix-cyan-dark.md) | Matrix Cyan | `dark` | — | Cyan code streams over a precise blue grid |
| [`matrix-violet-dark`](docs/matrix-violet-dark.md) | Matrix Violet | `dark` | — | Lavender code rain with magenta atmospheric light |
| [`matrix-paper-light`](docs/matrix-paper-light.md) | Matrix Paper | `light` | — | Quiet green code on a readable paper canvas |
| [`matrix-mint-light`](docs/matrix-mint-light.md) | Matrix Mint | `light` | — | Emerald characters drifting across cool mint |
| [`prism-depth-dark`](docs/prism-depth-dark.md) | Prism Depth | `dark` | — | Layered violet and rose prisms with pointer depth |
| [`polaris-parallax-dark`](docs/polaris-parallax-dark.md) | Polaris Parallax | `dark` | — | Polar light ribbons and a sparse distant sky |
| [`reef-parallax-dark`](docs/reef-parallax-dark.md) | Reef Parallax | `dark` | — | Ocean currents, coral light and layered underwater depth |
| [`sunrise-parallax-light`](docs/sunrise-parallax-light.md) | Sunrise Parallax | `light` | — | Peach sunrise ribbons with gentle warm parallax |
| [`petal-parallax-light`](docs/petal-parallax-light.md) | Petal Parallax | `light` | — | Rose and lilac layers floating like soft petals |
| [`dune-parallax-light`](docs/dune-parallax-light.md) | Dune Parallax | `light` | — | Sand-colored contour waves with terracotta depth |
| [`aurora-borealis-dark`](docs/aurora-borealis-dark.md) | Aurora Borealis Dark | `dark` | `aurora-borealis` | Luminous ribbons and distant stars over polar skies (dark) |
| [`aurora-borealis-light`](docs/aurora-borealis-light.md) | Aurora Borealis Light | `light` | `aurora-borealis` | Luminous ribbons and distant stars over polar skies (light) |
| [`firefly-grove-dark`](docs/firefly-grove-dark.md) | Firefly Grove Dark | `dark` | `firefly-grove` | Warm fireflies drifting through soft woodland shadows (dark) |
| [`firefly-grove-light`](docs/firefly-grove-light.md) | Firefly Grove Light | `light` | `firefly-grove` | Warm fireflies drifting through soft woodland shadows (light) |
| [`ocean-depths-dark`](docs/ocean-depths-dark.md) | Ocean Depths Dark | `dark` | `ocean-depths` | Layered ocean currents, rising bubbles and gentle light shafts (dark) |
| [`ocean-depths-light`](docs/ocean-depths-light.md) | Ocean Depths Light | `light` | `ocean-depths` | Layered ocean currents, rising bubbles and gentle light shafts (light) |
| [`forest-canopy-dark`](docs/forest-canopy-dark.md) | Forest Canopy Dark | `dark` | `forest-canopy` | Soft canopy circles and scattered sunlight between layered leaves (dark) |
| [`forest-canopy-light`](docs/forest-canopy-light.md) | Forest Canopy Light | `light` | `forest-canopy` | Soft canopy circles and scattered sunlight between layered leaves (light) |
| [`silver-rain-dark`](docs/silver-rain-dark.md) | Silver Rain Dark | `dark` | `silver-rain` | Slanted silver rainfall, broad ripples and low mist (dark) |
| [`silver-rain-light`](docs/silver-rain-light.md) | Silver Rain Light | `light` | `silver-rain` | Slanted silver rainfall, broad ripples and low mist (light) |
| [`cloud-harbor-dark`](docs/cloud-harbor-dark.md) | Cloud Harbor Dark | `dark` | `cloud-harbor` | Slow cloud banks drifting above a calm open horizon (dark) |
| [`cloud-harbor-light`](docs/cloud-harbor-light.md) | Cloud Harbor Light | `light` | `cloud-harbor` | Slow cloud banks drifting above a calm open horizon (light) |
| [`sakura-breeze-dark`](docs/sakura-breeze-dark.md) | Sakura Breeze Dark | `dark` | `sakura-breeze` | Rose petals and small highlights carried across a spring breeze (dark) |
| [`sakura-breeze-light`](docs/sakura-breeze-light.md) | Sakura Breeze Light | `light` | `sakura-breeze` | Rose petals and small highlights carried across a spring breeze (light) |
| [`autumn-embers-dark`](docs/autumn-embers-dark.md) | Autumn Embers Dark | `dark` | `autumn-embers` | Copper embers rising through layers of warm autumn haze (dark) |
| [`autumn-embers-light`](docs/autumn-embers-light.md) | Autumn Embers Light | `light` | `autumn-embers` | Copper embers rising through layers of warm autumn haze (light) |
| [`glacier-fjord-dark`](docs/glacier-fjord-dark.md) | Glacier Fjord Dark | `dark` | `glacier-fjord` | Icy contours, crystalline geometry and sparse drifting snow (dark) |
| [`glacier-fjord-light`](docs/glacier-fjord-light.md) | Glacier Fjord Light | `light` | `glacier-fjord` | Icy contours, crystalline geometry and sparse drifting snow (light) |
| [`desert-mirage-dark`](docs/desert-mirage-dark.md) | Desert Mirage Dark | `dark` | `desert-mirage` | Sweeping dune contours and fine sand moving in a warm mirage (dark) |
| [`desert-mirage-light`](docs/desert-mirage-light.md) | Desert Mirage Light | `light` | `desert-mirage` | Sweeping dune contours and fine sand moving in a warm mirage (light) |
| [`lavender-mist-dark`](docs/lavender-mist-dark.md) | Lavender Mist Dark | `dark` | `lavender-mist` | Lavender fog, quiet contour waves and distant pearl lights (dark) |
| [`lavender-mist-light`](docs/lavender-mist-light.md) | Lavender Mist Light | `light` | `lavender-mist` | Lavender fog, quiet contour waves and distant pearl lights (light) |
| [`coral-lagoon-dark`](docs/coral-lagoon-dark.md) | Coral Lagoon Dark | `dark` | `coral-lagoon` | Turquoise lagoon currents with coral highlights and rising bubbles (dark) |
| [`coral-lagoon-light`](docs/coral-lagoon-light.md) | Coral Lagoon Light | `light` | `coral-lagoon` | Turquoise lagoon currents with coral highlights and rising bubbles (light) |
| [`bamboo-dawn-dark`](docs/bamboo-dawn-dark.md) | Bamboo Dawn Dark | `dark` | `bamboo-dawn` | Slender bamboo-like shafts with warm dawn light and drifting pollen (dark) |
| [`bamboo-dawn-light`](docs/bamboo-dawn-light.md) | Bamboo Dawn Light | `light` | `bamboo-dawn` | Slender bamboo-like shafts with warm dawn light and drifting pollen (light) |
| [`thunder-horizon-dark`](docs/thunder-horizon-dark.md) | Thunder Horizon Dark | `dark` | `thunder-horizon` | Slow storm clouds and distant rain without flashing effects (dark) |
| [`thunder-horizon-light`](docs/thunder-horizon-light.md) | Thunder Horizon Light | `light` | `thunder-horizon` | Slow storm clouds and distant rain without flashing effects (light) |
| [`crystal-cavern-dark`](docs/crystal-cavern-dark.md) | Crystal Cavern Dark | `dark` | `crystal-cavern` | Faceted grids and luminous mineral trails inside a violet cavern (dark) |
| [`crystal-cavern-light`](docs/crystal-cavern-light.md) | Crystal Cavern Light | `light` | `crystal-cavern` | Faceted grids and luminous mineral trails inside a violet cavern (light) |
| [`lotus-pond-dark`](docs/lotus-pond-dark.md) | Lotus Pond Dark | `dark` | `lotus-pond` | Layered pond ripples, rose reflections and floating water lights (dark) |
| [`lotus-pond-light`](docs/lotus-pond-light.md) | Lotus Pond Light | `light` | `lotus-pond` | Layered pond ripples, rose reflections and floating water lights (light) |
| [`golden-savanna-dark`](docs/golden-savanna-dark.md) | Golden Savanna Dark | `dark` | `golden-savanna` | Golden grass-like trails and warm dust drifting across open plains (dark) |
| [`golden-savanna-light`](docs/golden-savanna-light.md) | Golden Savanna Light | `light` | `golden-savanna` | Golden grass-like trails and warm dust drifting across open plains (light) |
| [`alpine-meadow-dark`](docs/alpine-meadow-dark.md) | Alpine Meadow Dark | `dark` | `alpine-meadow` | Fresh meadow light, small floating seeds and cool mountain contours (dark) |
| [`alpine-meadow-light`](docs/alpine-meadow-light.md) | Alpine Meadow Light | `light` | `alpine-meadow` | Fresh meadow light, small floating seeds and cool mountain contours (light) |
| [`cosmic-tide-dark`](docs/cosmic-tide-dark.md) | Cosmic Tide Dark | `dark` | `cosmic-tide` | Orbital wave fields, fine stars and slow galactic currents (dark) |
| [`cosmic-tide-light`](docs/cosmic-tide-light.md) | Cosmic Tide Light | `light` | `cosmic-tide` | Orbital wave fields, fine stars and slow galactic currents (light) |
| [`paper-lanterns-dark`](docs/paper-lanterns-dark.md) | Paper Lanterns Dark | `dark` | `paper-lanterns` | Warm lantern-like lights ascending through a quiet evening haze (dark) |
| [`paper-lanterns-light`](docs/paper-lanterns-light.md) | Paper Lanterns Light | `light` | `paper-lanterns` | Warm lantern-like lights ascending through a quiet evening haze (light) |
