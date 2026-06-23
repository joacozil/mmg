# MMG Bank — Marketing Site

Static marketing site for MMG Bank (Spanish, `lang="es"`), built with **Astro 6**,
**React 19** islands, and **Tailwind CSS v4**. Deployed to **Cloudflare Pages**.

## Stack

| Concern        | Tool                                  |
| -------------- | ------------------------------------- |
| Framework      | Astro 6 (static output)               |
| Interactivity  | React 19 islands + GSAP / ScrollTrigger |
| Carousels      | Swiper                                |
| Styling        | Tailwind v4 (config-less, via `@theme` in CSS) |
| Images         | `astro:assets` (Sharp)                |
| Hosting        | Cloudflare Pages (Wrangler)           |
| Package manager| pnpm (Node ≥ 22.12)                   |

## Commands

```sh
pnpm install      # install dependencies
pnpm dev          # local dev server (http://localhost:4321)
pnpm build        # production build → ./dist/
pnpm preview      # preview the production build locally
pnpm deploy       # build + deploy to Cloudflare Pages
```

## Project structure

```
src/
├── pages/            One file per route; each composes a stack of components.
├── layouts/
│   └── Layout.astro  HTML shell, <head> meta, global scroll/scroll-restore scripts.
├── components/
│   ├── layout/       Site chrome shown on every page (Header, Footer, …).
│   ├── sections/     Composed, content-baked page blocks (+ their React islands).
│   └── ui/           Reusable, prop-driven building blocks (Section, SplitRow, …).
├── styles/
│   └── global.css    Tailwind import, fonts, design tokens, semantic type utilities.
└── assets/
    ├── fonts/        Bornia family (WOFF2).
    └── img/          Images (optimized at build by astro:assets).
```

Import alias: **`@/*` → `src/*`** (configured in `tsconfig.json`). Always import via
the alias, e.g. `import Section from "@/components/ui/Section.astro"`.

## Design system

Tokens, the responsive type scale, and semantic typography utilities (`text-h1`,
`text-p`, `text-btn`, …) live in [`src/styles/global.css`](src/styles/global.css).
See [`DESIGN.md`](DESIGN.md) for the full design language and [`PRODUCT.md`](PRODUCT.md)
for product context. Brand palette: cream `#F2EFEE`, primary green `#00AC69`,
darker green `#124734`.

## Conventions

See [`CLAUDE.md`](CLAUDE.md) for the component taxonomy, the `<Section>` wrapper,
how to handle images inside React islands, and other working conventions.
