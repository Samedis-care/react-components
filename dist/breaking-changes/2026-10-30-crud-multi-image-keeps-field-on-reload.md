# CrudMultiImage keeps its field while additional images reload

- **Date:** 2026-10-30
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`

## What changed

`additionalImagesLoading` shows the loading frame only until the additional images have
arrived once. When it is set again later, the field stays as it is: it keeps listing the
additional images passed last, ignores the ones passed while loading, and is marked
`aria-busy` until the flag is cleared. Then it lists the new ones.

## Why

Setting the flag replaced the whole field with the loading frame. An open edit dialog
closed, the focus fell to the page, and the field collapsed and grew back. The frame is
still shown at first, because before the additional images have arrived a primary that is
one of them is not listed, and MultiImage would fall back to the first own image.

## Migration

None needed. A field whose additional images reload no longer shows the loading frame
meanwhile.
