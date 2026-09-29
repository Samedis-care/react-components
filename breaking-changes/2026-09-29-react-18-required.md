# React 18 or 19 is required

- **Date:** 2026-09-29
- **Kind:** type
- **Scope:** `package.json` peer dependencies

## What changed

The peer dependencies `react`, `react-dom`, `@types/react` and `@types/react-dom` are
`^18 || ^19`. React 17 is no longer listed.

## Why

The library already needed React 18: it uses `useSyncExternalStore` and `useId`, and depends
on `@tanstack/react-query` 5, which requires React 18.

## Migration

Nothing to do on React 18 or 19. An app on React 17 has to upgrade.
