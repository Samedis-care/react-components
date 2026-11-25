# The InfoBox header announces a warning, success or error status

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

A header with `status="warning"`, `"success"` or `"error"` now starts with the
translated status, read out with the heading: a screen reader announces
"Warning: Please review, button, collapsed" where it used to say only "Please review".
The status is a visually hidden prefix inside the heading, so nothing changes visually.

`status="info"` and an unset status announce nothing: they are the neutral default, so the
word "Info" on every ordinary notice would only add noise.

## Why

The status was conveyed only by the header's color and its icon, which assistive
technology does not announce (WCAG 1.3.1 Info and Relationships, 1.1.1 Non-text Content).
A caller could not add hidden text either: `heading` is a plain string, so a workaround
could only show the status in the heading.

## Migration

- Required where the status was put into `heading` as a workaround
  (``heading={`${t("status.warning")}: ${title}`}``): remove it, or the status is read
  twice.
- Required where a test finds the header button or the heading by its accessible name:
  the name now includes the status, so `getByRole("button", { name: "Please review" })`
  no longer finds it. Match a substring or a regex (`name: /Please review/`), or expect
  `"Warning: Please review"`. `getByText("Please review")` still finds the heading,
  because the prefix is its own element; the header's `textContent` now starts with the
  prefix.
- Nothing to do for the look of the box.
