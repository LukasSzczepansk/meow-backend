# Third-party notices — Meow 4.0

Runtime packages used by the application:

- **Three.js** — MIT License — https://github.com/mrdoob/three.js
- **React Three Fiber** — MIT License — https://github.com/pmndrs/react-three-fiber
- **Drei** — MIT License — https://github.com/pmndrs/drei
- **Phaser** — MIT License — https://github.com/phaserjs/phaser
- **PixiJS** — MIT License — https://github.com/pixijs/pixijs

Legacy optional room-art downloader (`tools/install-room-assets.ps1`) may download CC0 art from original publishers, but MEOW 4.0's room renderer does not require or use that art for its main 3D scene.

No Pou assets, code, branding, characters or artwork are included or copied. The 2.5D room scene, furniture geometry, cat renderer and interaction mapping in this patch are Meow-specific implementation code.

## MEOW 4.1 — UI/UX reference projects

The MEOW 4.1 Product UI Rebuild uses product-structure and interaction-pattern references from the following MIT-licensed open-source projects. No repository is vendored wholesale and no branding, copy, imagery, or application identity is reused verbatim.

### Tilly
- Project: Tilly relationship journal
- Source: https://github.com/carlassmann/tilly
- License: MIT
- Referenced ideas: relationship-first information hierarchy, list-driven journal navigation, restrained mobile PWA presentation, local/offline-friendly interaction patterns.

### Sweet Couple Tales / CoupleConnect
- Project: Sweet Couple Tales
- Source: https://github.com/faizanshoukat5/sweet-couple-tales
- License: MIT
- Referenced ideas: memory album hierarchy, relationship timeline, favorites, date-idea organization.

### Couple Connect
- Project: Couple Connect
- Source: https://github.com/and3rn3t/couple-connect
- License: MIT
- Referenced ideas: mobile-first navigation density, touch-oriented relationship activities and concise list navigation.

MEOW keeps its own codebase, visual tokens, cat/living-room identity, wording, data model and interaction rules. These projects are design/architecture references rather than bundled runtime dependencies.

## MEOW 4.2 — visual component language references

MEOW 4.2 goes beyond information architecture and adapts concrete interaction/component patterns from MIT-licensed React projects, while retaining Meow-specific implementation, branding and tokens.

### Couple Connect
- Source: https://github.com/and3rn3t/couple-connect
- License: MIT
- Adapted patterns: touch-first action surfaces, filled active navigation states, mobile relationship-action hierarchy, compact icon + content rows, selected/pressed states.

### Timeless Love Anniversary App
- Source: https://github.com/Navaneeth223/timeless-love-anniversary-app
- License: MIT
- Adapted patterns: stronger romantic hero sections, prominent CTA hierarchy, richer surfaces, media-first presentation and gentle Framer Motion interaction language.

No third-party repository is bundled wholesale. No third-party branding, copy, screenshots or proprietary visual assets are included. Components were rewritten for the existing Meow Next.js/Tailwind architecture.
