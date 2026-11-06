# File links open only http(s), blob and data URLs, in a tab without access to the app

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/FileUpload` (`FileUploadGeneric`, its file entry `File` / FilePreview)

## What changed

- A click on a file (its name, icon or preview) opens its `downloadLink` with
  `window.open(url, "_blank", "noopener,noreferrer")`. The new tab has no `window.opener`,
  so it cannot reach or redirect the app's window, and no referrer is sent. It still opens
  as a tab, not as a popup window.
- Only http(s), blob and data URLs, and URLs relative to the page, count as a link. The
  scheme is read the way the browser reads it, so case, leading spaces and embedded tabs
  or newlines don't hide it. A `downloadLink` with any other scheme (`javascript:`,
  `vbscript:`, `file:`, `mailto:`, a custom app scheme, …), or one that is not a valid
  URL, is treated as no link: the file is not marked openable (no pointer, no underline),
  a click opens nothing, and `File`'s `onClick` is not called.

## Why

A file's link can come from data that users enter, such as a facility content's URL.
`window.open` ran a `javascript:` link as script in a new window whose `opener` was the
app, so it could read the app's cookies and DOM. An http(s) page opened from a file link
could also redirect the app's tab through `window.opener`.

## Migration

- Nothing to do for links that are http(s), blob, data or relative URLs.
- A page opened from a file link no longer gets `window.opener` or a `Referer` header. A
  download endpoint that checks the referrer has to accept requests without one.
- A `downloadLink` with another scheme is no longer opened or handed to `onClick`. Show
  such a link outside the file list.
