---
name: MMG Bank Design System
description: Premium flexible design system with strategic green tones and custom Bornia typography.
colors:
  cream: "#F2EFEE"
  light-green: "#A6E2B9"
  primary: "#00AC69"
  darker-green: "#124734"
  black: "#0D0D0D"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "Bornia, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Bornia, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
spacing:
  section-gap: "var(--section-gap)"
  element-padding: "var(--element-padding)"
---

# Design System: MMG Bank

## 1. Overview

**Creative North Star: "The Sovereign Garden"**

MMG Bank's design language is an elegant, editorial system that blends organic green tones with a warm cream canvas. It focuses on clean, responsive grids, crisp alignment, and high-contrast Bornia typography. The system values visual breathing room, clarity, and flat, structured blocks rather than heavy dropshadows or complex decorations.

## 2. Colors

A natural, high-prestige color palette of greens, warm neutrals, and stark contrast.

- **Alabaster Cream** (#F2EFEE): Core body background.
- **Deep Forest** (#124734): Primary text color, dark header backgrounds, and deep brand boundaries.
- **Active Green** (#00AC69): High-impact interactive accent (buttons, active navigation, links).
- **Sage Mist** (#A6E2B9): Soft green fill for light containers, subtle borders, and background divisions.
- **Ink Jet Black** (#0D0D0D) & **Pure White** (#FFFFFF): Core layout contrasts.

### Named Rules
**The Color Conservation Rule.** Keep the Active Green accent (#00AC69) to under 10% of any viewport to preserve its visual impact.

## 3. Typography

- **Display Type**: Bornia (Medium to Black weights for headers). Recommended styling uses `text-wrap: balance` to maintain clean header layouts.
- **Body Type**: Bornia (Regular weight). Keep line lengths under 75ch to ensure reading comfort.

## 4. Elevation

The visual layout is flat-by-default, emphasizing clear color blocks, clean 1px borders, and solid shapes rather than heavy shadows.

### Named Rules
**The Flat-by-Default Rule.** Use background colors or 1px outlines to divide layers. Shadows should only appear to signal hover/active states on interactive elements.

## 5. Components

### Buttons
- Flat rectangles with minimal rounding (4px radius).
- High-contrast background (e.g., Deep Forest or Active Green) and bold text.

### Cards & Layout blocks
- Flat shapes with minimal border-radius (8px).
- Rely on light background contrasts (e.g., White or Sage Mist) and clean borders.

### Inputs & Fields
- Plain, light backgrounds, sharp edges, and clean Active Green outlines when selected.

## 6. Do's and Don'ts

### Do:
- **Do** wrap primary blocks in `.container-custom` to maintain a unified grid width across device viewports.
- **Do** separate text and image content with generous spacing (`section-gap` and `element-padding`).
- **Do** maintain strong legibility (>=4.5:1 contrast) for all text.

### Don't:
- **Don't** use large rounded corners (border-radius > 12px) on cards or content blocks.
- **Don't** use soft, heavy shadows to convey structure; keep outlines clean and simple.
- **Don't** introduce complex gradient overlays under body text that reduce readability.
