# A files field in a grid cell takes one line: a link, or a count with a menu

- **Date:** 2026-11-13
- **Kind:** behavior, theme
- **Scope:** `backend-integration/Model/Types/Renderers/RendererFiles` (`ModelDataTypeFilesRenderer`)

## What changed

In a grid cell (a field whose overview visibility has `grid`, e.g.
`ModelVisibilityGridView`), `ModelDataTypeFilesRenderer` renders one line of text instead
of a bulleted list:

- no files: "No files present";
- one file: its name, as a link to the file;
- two or more files: their count ("2 files"), a button styled as a link that opens a menu
  of the files, each one a link to the file.

The links open the file in a new tab without access to the app window and without a
referrer. The link and the button have the cell's text color and are underlined. Using
them neither selects the row nor, on double click, opens the record. A file with an image
preview shows its name in the grid, not the image.

The new texts are `backend-integration.model.types.renderers.files.count_one` /
`count_other` (and the plural forms `count_few` / `count_many` where a language has
them), in every locale. The new theme component `CcFilesGrid` has the style override
slots `root` (the line) and `menuButton` (the count's button).

Forms (edit and view) are unchanged.

## Why

A grid row is one line, 57px high, and a data cell clips what does not fit. The list's
margins pushed "No files present" half out of the cell, and every file after the first
was below the row, where nobody could see or click it.

## Migration

Nothing to do. No app shows a files column in a grid today; a grid that gets one shows
the line above.
