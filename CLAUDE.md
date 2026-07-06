# CLAUDE.md

Working conventions for this repo. See [README.md](README.md) for stack & commands.

## What this is

Static Astro 6 marketing site for MMG Bank — Spanish (`lang="es"`), 7 routes,
React 19 islands for animation (GSAP) and carousels (Swiper), Tailwind v4,
deployed to Cloudflare Pages.

## Imports

- Use the **`@/*` alias** (→ `src/*`) for all cross-directory imports.
  e.g. `import SplitRow from "@/components/ui/SplitRow.astro"`.
- Same-folder imports may stay relative (e.g. a section importing its own island).

## Component taxonomy (`src/components/`)

- **`layout/`** — site chrome on every page: `Header`, `Footer`, `EnLineaDropdown`.
- **`sections/`** — composed page blocks with their content baked in (`Hero`, `Stats`,
  `CreditFacilities`, `Banners`, `ClientDivisions`, `Team`, …). React islands live here
  next to the `.astro` wrapper that feeds them (`Hero.astro` ↔ `HeroSection.tsx`).
  For symmetric multi-variant content (e.g. `ClientDivisions`'s "cliente individual" /
  "cliente corporativo" split), drive repeated `ui/` blocks (like `SplitRow`) off a
  data array instead of duplicating markup per variant.
- **`ui/`** — reusable, prop-driven building blocks: `Section`, `SplitRow`, `MediaCards`,
  `ThreeColumnBanner`, `FeaturesGrid`, `MarketStack`, `ProcessSteps`, `IntroList`,
  `PageHero`, `LinkMore`.

### Pages compose, sections contain

Pages ([`src/pages/`](src/pages)) read as a clean stack of components — no bespoke
inline markup. Subpages keep declarative `ui/` calls (`PageHero`, `IntroList`) with
props in the page; anything more bespoke is extracted into a `sections/` component.
Match the existing pattern when adding content.

## Section wrapper

Use [`@/components/ui/Section.astro`](src/components/ui/Section.astro) instead of
hand-writing `<section class="w-full bg-cream … overflow-hidden">`.

```astro
<Section>              <!-- full vertical section-gap (default) -->
<Section spacing="tight">  <!-- pt-0: stacked under a previous section -->
<Section spacing="open">   <!-- pb-0: flows into the next section -->
```

Extra attributes (`id`, `data-*`) and a `class` are forwarded to the `<section>`.
Note: `Contact` uses `overflow-x-clip` instead of `overflow-hidden`, so it keeps a
raw `<section>` — don't force it into `<Section>`.

## Images

- In `.astro`, use `<Image />` from `astro:assets` (auto WebP/responsive). It defaults
  to `loading="lazy"`; mark **above-the-fold/LCP** images `loading="eager"` +
  `fetchpriority="high"` (see [`PageHero.astro`](src/components/ui/PageHero.astro)).
- **React islands render plain `<img>`** and can't use `<Image>`. Optimize in the
  `.astro` wrapper with `getImage({ src, format: "webp", width })` and pass `.src`
  to the island (see [`Hero.astro`](src/components/sections/Hero.astro) /
  [`Gallery.astro`](src/components/sections/Gallery.astro)). Set `loading`/`decoding`
  directly on the island's `<img>`.

## Styling

- Tailwind v4, config-less: tokens & theme live in `@theme`/`:root` in
  [`global.css`](src/styles/global.css). No `tailwind.config.js`.
- Prefer **semantic type utilities** (`text-h1`, `text-h2`, `text-p`, `text-p-large`,
  `text-p-small`, `text-btn`) over raw `text-[size]` classes; override with `!` when needed.
- Brand colors as Tailwind classes: `bg-cream`, `text-primary`, `bg-darker-green`,
  `text-light-green`, `bg-ultra-light-green`. Spacing: `py-section-gap`, `p-element-padding`.
- Fonts: **Bornia**, WOFF2 only, weights 300/400/500/600/700 (no italics, no 800/900).
  Add a weight back to `global.css` `@font-face` before using it.

## Gotchas

- The hero's animated background uses the `.gradient-bg` / `.gradient-bg__canvas`
  CSS classes (defined in `global.css`) directly from `HeroSection.tsx` — there is no
  `GradientBg` component. Don't delete that CSS as "unused".
- `Layout.astro` disables browser scroll restoration and restores scroll manually
  (GSAP pin spacers change document height). Interior pages drive header sticky-state
  from `PageHero.astro`; the homepage drives it from `HeroSection.tsx`.
- Verify changes with `pnpm build` (static build catches broken imports & types).
