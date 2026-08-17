# Git Page Layouts

Canonical home of the official Git Page Docs layout themes. Any repository can
consume these layouts:

- **Official remote (default):** generated `gitpagedocs/config.json` files
  point at this folder's `layoutsConfig.json` and `templates/`.
- **Self-hosted:** copy this folder to the root of your repository as
  `gitpagelayouts/` (or generate a local `gitpagedocs/layouts/` with
  `npx gitpagedocs --layoutconfig`) and the viewer resolves it automatically.

The JSON files here are the source of truth. After changing any of them,
regenerate this catalog with `npm run layouts:sync`.

## Files

- [`layoutsConfig.json`](layoutsConfig.json) — index of every layout.
- [`layoutsFallbackConfig.json`](layoutsFallbackConfig.json) — minimal fallback set.
- [`templates/`](templates) — one JSON theme template per layout.
- [`docs/`](docs) — one markdown page per layout (generated).

## Layouts (62)

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
