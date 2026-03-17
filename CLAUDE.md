# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build           # Compile TypeScript to dist/ and copy assets
npm run lint            # Lint src/ with ESLint
npm run lint-fix        # Auto-fix lint issues
npm run storybook       # Start Storybook dev server (port 6006)
npm run test            # Run all tests (unit + stories)
npm run test:unit       # Run unit tests only (test/**/*.test.{ts,tsx})
npm run test:stories    # Run story-based component tests only
npm run test:watch      # Run tests in watch mode
npm run docgen          # Generate TypeDoc documentation
```

## Architecture

This is a Material-UI v7 based React component library published as `components-care`. It's organized into five tiers that build on each other:

1. **`src/standalone/`** — Controlled UI components with no external dependencies; the pure view layer
2. **`src/framework/`** — Application framework wiring: i18n (i18next), theming (MUI), data fetching (React Query), permissions, dialogs, error tracking (Sentry optional)
3. **`src/non-standalone/`** — Framework-dependent UI components (require the Framework context)
4. **`src/backend-integration/`** — Data layer abstractions: `Connector`, `Model`, `Store` backed by React Query
5. **`src/backend-components/`** — Backend-connected UI components (Form, DataGrid, FileUpload, Selector, CRUD) that wire standalone views to backend-integration models

All exports are aggregated in `src/index.ts`. Theme slot overrides for all components are declared in `src/theme-def.ts` using MUI's module augmentation pattern with the `Cc<ComponentName>` naming convention.

## Component Conventions

- All components must be wrapped with `React.memo`. Name the inner function before wrapping — anonymous memo components are rejected.
- Avoid inline functions/objects in render; use `useCallback`/`useMemo` or static variables.
- Component styling uses MUI's `styled()` + `useThemeProps()`. No global CSS or inline styles.
- Each component folder exports via its own `index.ts`. Do not mix component definitions and re-export indexes in the same file.
- Storybook stories are required for all visible components.
- `@ts-ignore` requires an explanatory comment.
- Style names follow `Cc<ComponentName>` to avoid collisions in MUI theme.

## Adding a New Component

1. Decide which tier it belongs to (standalone → non-standalone → backend-component).
2. Create a folder under the appropriate `src/<tier>/` directory with its own `index.ts`.
3. Export it from the parent tier's `index.ts`.
4. Register theme overrides in `src/theme-def.ts`.
5. Add a Storybook story capturing all props via controls/actions.

## Testing

- **Unit tests** live in `test/standalone/` — run with `npm run test:unit`
- **Story tests** use Storybook's Vitest addon with Playwright browser mode — run with `npm run test:stories`
- Stories support `play` functions for interaction tests (click, type, assert). Import `fn`/`expect` from `storybook/test`. Use `fn()` only in `args`, never inside render functions.
- `preview.ts` wraps all stories in MUI `ThemeProvider` via `createElement`

## CI/CD

- **PR checks**: lint + unit tests + build (`.github/workflows/pull-request.yml`)
- **Push to master**: lint + unit tests + build → publish dist to `master_dist` branch → deploy Storybook + TypeDoc to GitHub Pages (`.github/workflows/main.yml`)
- GitHub Pages serves: `/storybook/` (component library) and `/typedoc/` (API docs)

## i18n

Translation files live in `src/assets/i18n/`. To add translations use [i18n Manager](https://www.electronjs.org/apps/i18n-manager). The library's i18next instance is exported as `ComponentsCareI18nInstance` from `src/i18n.ts`.
