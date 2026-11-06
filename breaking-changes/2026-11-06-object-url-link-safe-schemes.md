# ObjectUrlLink links only http(s), blob and data URLs

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/FileUpload` (`ObjectUrlLink`), `backend-integration/Model/Types/Renderers` (`RendererFiles`)

## What changed

- `ObjectUrlLink` sets `href` only for http(s), blob and data URLs, and for URLs relative
  to the page. The scheme is read the way the browser reads it, so case, leading spaces
  and embedded tabs or newlines don't hide it. For any other scheme (`javascript:`,
  `vbscript:`, `file:`, `mailto:`, a custom app scheme, …), or a value that is not a
  valid URL, it renders the anchor without `href`: the text is shown, but it is not a
  link, and a click does nothing.
- `RendererFiles` lists its files through `ObjectUrlLink`, so a file whose `downloadLink`
  has another scheme is listed by name only in a read-only view.

## Why

A file's link can come from data that users enter. React 18 renders a `javascript:` href
as it is (it only warns), so a click ran the script in the app's own window, with access
to its cookies and storage. React 19 replaces such a link with one that throws, but still
renders it as a link. Both versions now render the same: no link.

## Migration

- Nothing to do for links that are http(s), blob, data or relative URLs.
- An `ObjectUrlLink` that was given a `mailto:`, `tel:` or app-specific link no longer
  links it. Use a plain `<a>` for such links.
