# GenericDataPreview shows the rows of new data

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `backend-components/CRUD/Import` (`GenericDataPreview`, and with it the import wizard's file preview and its review)

## What changed

`GenericDataPreview` reloads its rows when it gets another `data` array or another `model`.
The search, the filters and the sort stay as they are; the grid scrolls back to the top, as
after a filter change. Before, the grid kept the rows it had loaded first: another `data` was
shown only in pages loaded later (scrolling down), next to the old rows, and another `model`
only rendered those later pages.

## Why

A second file picked in the upload step kept showing the first file's rows, and the review
kept the error texts of the old language after a language change.

## Migration

Required for a caller that builds `data` or `model` anew on every render (e.g.
`data={rows.map(…)}` in the JSX): pass the same array and model while the rows stay the same,
or the grid reloads and scrolls to the top on every render of the caller.

```tsx
const data = useMemo(() => rows.map(toPreviewRow), [rows]);
return <GenericDataPreview data={data} />;
```

SCF's `ImportSteps/Step1` passes `state.data`, which changes only when a file is loaded:
nothing to do there.
