# An image's placeholder is announced as "No image present"

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `ModelDataTypeImageRenderer` with a `placeholder`, where it only shows the
  image: grid cells (`BackendDataGrid` and the other model grids) and read-only form fields

## What changed

- When no image is stored and the renderer shows its `placeholder`, the placeholder's alt
  text is "No image present" (`backend-integration.model.types.renderers.image.not-set`,
  in the library's current language), the text the renderer shows when it has no
  placeholder. It used to be the field's label.
- A stored image keeps the field's label as its alt text.
- Nothing changes visually. The editable form field (`ImageSelector`) is unchanged.

## Why

The placeholder and a stored image had the same alt text, the field's label, so a screen
reader announced a row without an image the same way as a row with one. In a column whose
header is empty, nothing else told the two apart.

## Migration

- Nothing is required.
- Tests that find a placeholder by its alt text (`getByAltText(label)`,
  `getByRole("img", { name: label })`) find it by "No image present" now.
