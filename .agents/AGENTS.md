# Agent Rules & Guidelines

## Next.js & Plasmic Styling Invariants

### 1. Avoid Zero-Specificity Selectors (`:where()`) in CSS Modules
- Never wrap root component selectors in `:where(...)` inside CSS Modules (e.g., `:where(.breadcrumbs)`).
- **Why**: `:where()` sets selector specificity to zero (`0,0,0`). While this may seem to work on the Next.js Dev server due to DOM `<style>` insertion order, Next.js production builds (Vercel) concatenate and reorder CSS bundles. Standard class selectors (like Plasmic reset classes `__wab_instance` or `sty.*` with specificity `0,1,0`) will completely override zero-specificity styles in production, leading to missing padding, background colors, or layout breakage.

### 2. Dev vs. Production CSS Parity Verification
- Always ensure component CSS Module selectors have standard class specificity (`0,1,0` or higher) so component styles retain priority when bundled alongside framework or Plasmic wrapper styles.
- When fixing styling issues, verify that styles rely on explicit class specificity rather than DOM order assumptions.

## Next.js App Router & Plasmic Integration

### 1. Client Component Wrappers
- Since Plasmic components are being integrated into an App Router setup, you must ensure that every page or component provided includes a `'use client'` wrapper component.

## Code Quality & Production Build Verification

### 1. Proactive Linting & Build Checking
- Always verify changes against ESLint (`npm run lint`) and production compilation (`npm run build`) before completing tasks or recommending code to be committed/pushed.
- **Why**: Local development server (`npm run dev`) is lenient with unescaped React entities, unused variables, or subtle type mismatches, but Vercel production deployments strictly enforce `--max-warnings 0` and fail builds on any ESLint error or warning.
- Fix all lint errors, unused imports/variables, or type mismatches immediately within modified files rather than leaving them for production deployment to catch.
